import {get} from "jquery";
import ServerActions from "./actions/ServerActions";

let API = {
  fetchLinks() {
    console.log('1: In API fetchLinks, before get /data/links and calling ServerActions.receiveLinks with get response');
    // Ajax request to read links
    get("/data/links").done(resp => {
      ServerActions.receiveLinks(resp);
    });
  }
};

export default API;
