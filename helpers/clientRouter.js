let CLIENTURL = '';

switch( window.location.hostname) {
    case 'localhost' || '127.0.0.1': 
        APIURL = 'http://localhost:3000';
        break;
    // case 'coop-catalog-jmi.herokuapp.com' :
    //     APIURL = 'https://coop-catalog.herokuapp.com';
}

export default CLIENTURL;