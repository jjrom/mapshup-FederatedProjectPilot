mapshup-FederatedProjectPilot
=============================

mapshup build for the Ground Segment Coordination Body (GSCB - http://earth.esa.int/gscb/) Federated Project Pilot


Prerequesites
=============

* Apache (v2.0+)


Installation
============

In the following, we suppose that $FPP_TARGET is the directory where mapshup-FederatedProjectPilot will be installed and $FPP_HOME the directory containing this file

        cd $FPP_HOME
        ./build.sh -a -t $FPP_TARGET

Configuration
=============

Edit $FPP_HOME/src/config.js to match your installation.

Edit $FPP_HOME/src/ws/config.php to match your installation.


Post Installation
=================

        # Run this command each time you modify a file under $FPP_HOME/src
        $FPP_HOME/build.sh -t $FPP_TARGET

Notes
=====

FEDEO datasources are available [here](http://geo.spacebel.be/opensearch/readme.html)