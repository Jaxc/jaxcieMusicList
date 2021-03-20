/*    
    @licstart  The following is the entire license notice for the 
    JavaScript code in this page.

    Copyright (C) 2021 Jacob Rosén

    The JavaScript code in this page is free software: you can
    redistribute it and/or modify it under the terms of the GNU
    General Public License (GNU GPL) as published by the Free Software
    Foundation, either version 3 of the License, or (at your option)
    any later version.  The code is distributed WITHOUT ANY WARRANTY;
    without even the implied warranty of MERCHANTABILITY or FITNESS
    FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

    As additional permission under GNU GPL version 3 section 7, you
    may distribute non-source (e.g., minimized or compacted) forms of
    that code without the copy of the GNU GPL normally required by
    section 4, provided you include this license notice and a URL
    through which recipients can access the Corresponding Source.   


    @licend  The above is the entire license notice
    for the JavaScript code in this page.
*/


/* Ths function is taken from https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server 
 * and is licenced as CC-BY-SA 3.0  */
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

/* GPL CODE STARTS HERE */

document.forms['inputForm'].elements['inputFile'].onchange = function(evt) {
    if(!window.FileReader) return; // Browser is not compatible
    var reader = new FileReader();

    reader.onload = function(evt) {
        if(evt.target.readyState != 2) return;
        if(evt.target.error) {
            alert('Error while reading file');
            return;
        }

        filecontent = evt.target.result;

        [filename, filetype] = document.forms['inputForm'].elements['inputFile'].files[0].name.split('.');

        tracklist = "";

        switch(filetype) {
            case 'txt' :
                tracklist = handle_txt(filecontent);
                break;
            case 'm3u8':
                tracklist = handle_m3u8(filecontent);
                break;
        }

        if (tracklist == "") {
            // Parsing failed, do nothing
            return;
        } 

        download(filename + '_tracklist.txt', tracklist);
        
    };

    reader.readAsText(evt.target.files[0]);
};

function handle_txt (filecontents) {
    data = CSVToArray(filecontents, '\t');

    artistFound = false
    trackFound = false
    for(i = 0; i < data[0].length; i++) {
        if (data[0][i] == 'Artist') {
            artistFound = true;
            artistIndex = i;
        }

        if (data[0][i] == 'Track Title') {
            trackFound = true;
            trackIndex = i;
        }

        if((trackFound == true) && (artistFound == true)) {
            break;
        }

    }

    if ((artistFound == false) || (trackFound == false)) {
        return "";
    }
    out_string = "";
    for (i = 1; i < data.length - 1; i++) {
        artist = data[i][artistIndex];
        track = data[i][trackIndex];

        out_string = out_string.concat(artist + " - " + track + "\r\n");
    }

    return out_string;
}

function handle_m3u8 (filecontents) {
    out_string = "";
    fileArray = filecontents.split('\r\n');
    for (i = 1; i < fileArray.length; i++) {
        if (fileArray[i][0] == '#') {
            out_string = out_string.concat(fileArray[i].replace(/^\#EXTINF:\d*,(.*)\ -\ (.*)/, '$1 - $2\r\n'));
        }
    }

    return out_string;
}