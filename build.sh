#!/bin/bash
#
# mapshup-FederatedProjectPilot
# Web client build script for GSCB Federated Project Pilot
#
# Author : Jerome Gasperi @ CNES
# Date   : 2014.05.27
# Version: 1.0
#

# Set default values - can be superseeded by command line
SRC=`pwd`
PROJECT=fpp
COMPILE=NO
CLONE=NO

# TARGET directory is mandatory from command line
usage="## mapshup client build script for OWS-10\n\n  Usage $0 -t <target directory> [-s <source directory> -p <project name> -a -c]\n\n  -a : performs steps 1. mapshup git clone, 2. mapshup compile and 3. build\n  -c : perform steps 1. mapshup compile and 2.build\n  (By default, only build step is performed)\n"
while getopts "act:s:h" options; do
    case $options in
        a ) CLONE=YES
            COMPILE=YES;;
        c ) COMPILE=YES;;
        t ) FPP_TARGET=`echo $OPTARG`;;
        s ) SRC=`echo $OPTARG`;;
        p ) PROJECT=`echo $OPTARG`;;
        h ) echo -e $usage;;
        \? ) echo -e $usage
            exit 1;;
        * ) echo -e $usage
            exit 1;;
    esac
done
if [ "$FPP_TARGET" = "" ]
then
    echo -e $usage
    exit 1
fi

# git clone
if [ "$CLONE" = "YES" ]
then
    echo -e " -> Clone mapshup git repository to $SRC/mapshup directory"   
    git clone https://github.com/jjrom/mapshup.git /tmp/mapshup-src
fi

if [ "$COMPILE" = "YES" ]
then
    echo -e " -> Compile mapshup to $FPP_TARGET directory"
    /bin/rm -Rf $FPP_TARGET
    /tmp/mapshup-src/utils/packer/pack.sh /tmp/mapshup-src $FPP_TARGET default 0 $SRC/src/buildfile.txt 1
    rm -Rf $FPP_TARGET/s/README_INSTALL.txt
    rm -Rf $FPP_TARGET/s/_installdb
fi

echo -e " -> Copy $PROJECT files to $FPP_TARGET directory"
if [ ! -d $FPP_TARGET/$PROJECT ]
then
    mkdir $FPP_TARGET/$PROJECT
fi
cp -f $SRC/src/config.js $FPP_TARGET/$PROJECT
cp $SRC/src/index.html $FPP_TARGET
cp $SRC/src/FPP.js $FPP_TARGET/$PROJECT
cp $SRC/src/style.css $FPP_TARGET/$PROJECT
cp -R $SRC/src/img $FPP_TARGET/$PROJECT
cp -R $SRC/src/ws $FPP_TARGET/$PROJECT

echo -e " -> done!\n"
