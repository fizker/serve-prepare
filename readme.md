# @fizker/serve-prepare

Tool for preparing a site for being statically hosted by [@fizker/serve][1].

Like [@fizker/serve][1], this is meant to be used in conjunction with [Docker](https://www.docker.com), and feature decisions are meant to utilize the cache mechanisms that Docker provides.


## How to use

The optimal way to use it is to make use of [multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/). The build needs at least three stages:

1. Build stage. This is where the project does its own stuff, like webpack, content preparation and minification.
2. Preparation stage. This is where @fizker/serve-prepare runs.
3. Serve stage. This is the final stage that is sent to the server farm. It contains only [@fizker/serve][1] and the static files.

To start the build, run `docker build -t <your docker user>/<your project name> .`.

To start the server, see the documentation for [@fizker/serve][1] for details.


### Optimizing for development

Per default, all files are also compressed. This is good for production, but takes longer and thus makes the turn-around time worse during development. For this reason, compression can be disabled.

There are two ways to do this:

1. Add `--skip-compression` to `npx serve-prepare build` command
2. Set `SERVE_SKIP_COMPRESSION=true` env variable before running `npx serve-prepare build` command.

The [sample Dockerfile](#sample-dockerfile) sets up the env variable by using a Docker build-arg. Then to skip compression, run Docker with the `--build-arg skip_compression=true` flag like so: `docker build --build-arg skip_compression=true -t <your docker user>/<your project name> .`.

For a way to listen to changes instead of a full rebuild, see the [“Listening to changes during development” section](#listening-to-changes-during-development)


### Sample .dockerignore file

See [the sample .dockerignore](./sample-dockerignore) file for a full example.

Running `npx flow serve-prepare create-dockerfile` will create a sample .dockerignore and Dockerfile in the current directory.

The dockerignore should include everything that is not necessary for building, since that makes the docker build faster and utilizes the docker cache better.

Common entries includes:

- .git - There is a lot of data here, and stuff like branches and tags should not affect the docker build.
- node_modules - Modules might need to be compiled for the platform, so it is better to include the package.json and package-lock.json and do `npm install` than to copy the local node_modules. The docker caching will ensure that `npm install` is not rerun until either package*.json file changes.
- tests - The docker image is for deployment. Tests are not needed.
- build artifacts - The docker image will regenerate the build artifacts anyway.


### Sample Dockerfile

See [the sample Dockerfile](./sample-Dockerfile) file for a full example.

Running `npx flow serve-prepare create-dockerfile` will create a sample .dockerignore and Dockerfile in the current directory.

The sample file includes comments explaining the parts. Some parts might be different depending on the specific project. These are marked with `###`.

The following are of particular note:

- There is an expectation that the raw files are created by running `npx webpack`. This should be changed if necessary.
- There is an expectation that the raw files are placed in a folder called `/static`. This should be changed as necessary.
- If private NPM repositories are in play, add authentication to an `.npmrc` file and copy that in before running `npm install`.
- HTTPS/HTTP2 support is done by copying certificates into the container in the last stage. There are some default filenames baked into the image. Please make sure that they correspond to real files, or remove/comment the HTTPS lines; [@fizker/serve][1] will operate in HTTP-only mode if any of the three HTTPS env vars are missing.


### sample serve-setup-request.json

See [the sample serve-setup-request](./sample-serve-setup-request.json) file for a full example.

Running `npx flow serve-prepare create-setup-request` will create a sample setup-request file in the current directory.

This file contains any settings that needs to be considered for serving the content later. It contains the following segments:

- `catchAllFile` - The file that will be served if a client requests a path that does not match an existing file. The file must exist among the files to host. This can be left as `null`, in which case a standard `404` message is returned for unknown files. See the next segment for how to format this object.
- `files` - A list of overrides for files. If any of these refer to a non-existing file, it is simply ignored. See the next segment for how to format this object.
- `aliases` - A list of aliases to resolve. This allows the same physical file to be served for multiple paths. An `Alias` object must conform to the following JSON structure:
  `{ "from": "/path/to/alias", "to": "/path/to/file/or/alias" }`.
- `globalHeaders` - A string-string object of headers to add to all outgoing requests, unless overridden by the specific path.

The `File` object used by the `files` or `catchAllFile` segments must adhere to the following JSON structure:

```
{
	"path": "/path/to/file",
	"mime": "plain/text",
	"statusCode": 200,
	"headers": {
		"header": "value"
	}
}
```

- `path` - This is the only required property. It must start with `/`. It should not be URI encoded.
- `mime` - The mime-type to return for this file. If omitted, an attempt will be made to auto-detect this from the extension of the file. If that fails, the `docker build` command will fail.
- `statusCode` - The HTTP status code to return for the file. If omitted, it will default to `200`. This is mostly useful for custom 404 errors.
- `headers` - A string-string object of headers to add for the file. Entries here will override any matching values from the `globalHeaders`. This allows easily setting default headers and override on individual files, like cache headers for everything but the `index.html` file.

## Listening to changes during development

Instead of rebuilding the image from scratch after every change, it is more convenient and efficient to build incremental changes, especially for big webpack builds.

To achieve this, a dev Docker image can be used to great effect. Please note that this is not nearly as performant as the production build, so it should only be used for development.

See [the sample development Dockerfile](./sample-Dockerfile-dev) file for a full example.

Running `npx flow serve-prepare create-dockerfile --dev` will create a sample Dockerfile-dev file in the current directory.

It is much simpler than the regular Dockerfile, but there are more restrictions to running it.

The only thing of interest in the Dockerfile itself is the HTTPS part. It is similar to the regular Dockerfile; if HTTPS is not required, simple remove the lines.

To run it, three steps are required:


### First step, producing the dev image

```
docker build --tag \
	<your docker user>/<your project name>-dev \
	--file Dockerfile-dev \
	.
```

The `--file` refers to the dev version of Dockerfile. Since this is not production, the default name cannot be used.

The image name have `-dev` appended to avoid name conflicts with the production image.


### Second, running the dev image

```
docker run --detach \
	--publish 8080:8080 --publish 80443:8081 \
	--name web-client \
	--mount type=bind,source="$(pwd)"/static,destination=/root/target,consistency=cached \
	<your docker user>/<your project name>-dev
```

We bind the ports to whatever we prefer. If HTTPS is not required, the second port is not required either.

The `--name` is pure convenience. This allows the name to be referred in future `docker` commands instead of copying the container SHA.

The magic lies in the `--mount` part. It creates a link between the folder on the host machine that contains the build output and the container hosting the files. If the build output is not located in `$pwd/static` from where the command is being run, alter the `source=` parameter accordingly.


### Third, run the build tool for your project

If webpack is used, this is most likely `npx webpack --watch`. The build tool will then update the build output whenever files are changed, and the development server will serve any files as they are.


[1]: https://github.com/fizker/serve
