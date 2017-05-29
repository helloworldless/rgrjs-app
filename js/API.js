//import {get} from "jquery";
import {post} from "jquery";
import ServerActions from "./actions/ServerActions";

let API = {
  fetchLinks() {
    console.log('1: In API fetchLinks; get links from GraphQL, ServerActions.receiveLinks with get response');
    // Ajax request to read links
    post("/graphql", {
      query: `{
        links {
          _id,
          title,
          url
        }
      }`
    }).done(resp => {
      ServerActions.receiveLinks(resp.data.links);
    });
  }
};

export default API;
