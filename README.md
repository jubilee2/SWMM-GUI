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

---

## Web-based SWMM Runner

This project also contains a Node.js web server for running SWMM simulations and viewing results through a web browser.

### Server Setup

1.  **Install Node.js:** Make sure you have a recent version of Node.js installed.
2.  **Install Dependencies:** Open a terminal in the project root and run `npm install`.

### Providing the SWMM Engine

This server requires the official SWMM command-line executable to run simulations.

1.  **Download SWMM:** Visit the [official EPA SWMM Website](https://www.epa.gov/water-research/storm-water-management-model-swmm) and download the latest version of the SWMM installation package for your operating system (Windows, Linux, or macOS).
2.  **Locate the Executable:**
    *   For **Windows**, find the `swmm5.exe` file.
    *   For **Linux** or **macOS**, the executable is typically named `swmm5`.
3.  **Place the Executable:** Copy the SWMM executable file into the root directory of this project. The server is configured to look for it there.

### Running the Server

Once the setup is complete, you can start the server by running:
`node server.js`

The server will be available at `http://localhost:3000`.
