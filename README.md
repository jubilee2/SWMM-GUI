ORD Stormwater-Management-Model Graphical User Interface
==================================

Stormwater Management Model (aka "SWMM") GUI only


<!-- ## Build Status
[![Build and Test](https://github.com/USEPA/Stormwater-Management-Model/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/USEPA/Stormwater-Management-Model/actions/workflows/build-and-test.yml) -->

## Disclaimer 
The United States Environmental Protection Agency (EPA) GitHub project code is provided on an "as is" basis and the user assumes responsibility for its use. EPA has relinquished control of the information and no longer has responsibility to protect the integrity, confidentiality, or availability of the information. Any reference to specific commercial products, processes, or services by service mark, trademark, manufacturer, or otherwise, does not constitute or imply their endorsement, recommendation or favoring by EPA. The EPA seal and logo shall not be used in any manner to imply endorsement of any commercial product or activity by EPA or the United States Government.


## Introduction

This is the official SWMM Windows GUI source code repository maintained by US EPA Office of Research and Development, Center For Environmental Solutions & Emergency Response, Water Infrastructure Division located in Cincinnati, Ohio. The interface was written using Embarcadero's Delphi
10.4 (www.embarcadero.com). The name of the Delphi project containing
the code is Epaswmm5. All of the files for the project can be found
in the Epaswmm5 folder within this archive.

Before the Epaswmm5 project can be loaded into Delphi's Integrated
Development Environment (IDE), several special components must be
installed into the IDE's component pallette. The source code for
these components is contained in the Components folder in this
archive. Consult the Installation.txt file in that folder for
instructions on how to install these components.

SWMM is a dynamic hydrology-hydraulic water quality simulation model. It is used for single event or long-term (continuous) simulation of runoff quantity and quality from primarily urban areas. SWMM source code is written in the C Programming Language and released in the Public Domain.

## Find Out More
The source code distributed here is identical to the code found at the official [SWMM Website](http://www2.epa.gov/water-research/storm-water-management-model-swmm).

## Setup and Usage

### Install Dependencies

Install Node dependencies for both the Express backend and the React client from the project root:

```bash
npm install
npm --prefix client install
```

### Development

Start the Vite dev server for the React client and the Express API in separate terminals:

```bash
npm --prefix client run dev
npm start
```

The Vite dev server proxies `/api` requests to `http://localhost:3000` during development.

### Production

Build the React client and then launch the Express server to host the compiled app:

```bash
npm run build
npm start
```

### API Output

The Express server exposes an `/api/output` endpoint that returns the contents of `swmm-output.txt`.
This sample output file lives in the project root and demonstrates delivering a SWMM result through the API.

### Server Tests

Run backend unit tests with:

```bash
npm run test:server
```

### Uploading INP Files

1. Start both the client and API servers:
   ```bash
   npm --prefix client run dev
   npm start
   ```
2. Open the client in your browser (`http://localhost:5173` by default).
3. In the **Parse INP File** form, choose a `.inp` file and click **Upload**.
4. When parsing succeeds, markers are added to the map for each entry in the
   file's `COORDINATES` section. The map automatically pans and zooms to fit
   the uploaded markers. If no coordinates are found, the map remains at its
   default view.

![Map before INP upload](docs/map_before.png)
![Map after INP upload](docs/map_after.png)

*Above: the map before and after uploading an `.inp` file.*

![Map upload demo](docs/map_upload.gif)

#### Limitations & Future Enhancements

* Large `.inp` files may take noticeable time to upload and parse.
* Only the `COORDINATES` section is currently visualized; other spatial
  information is ignored.

Planned enhancements include:

* Streaming or chunked parsing for large files.
* Improved feedback during upload (e.g., progress indicators).
* Support for additional geometric layers and editing tools.
