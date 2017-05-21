import AppDispatcher from "../AppDispatcher";
import {ActionTypes} from "../Constants";

let ServerActions = {
  receiveLinks(links) {
    console.log('2: In ServerActions, before Dispatch action RECEIVE_LINKS with links data');
    AppDispatcher.dispatch({
      actionType: ActionTypes.RECEIVE_LINKS,
      links
    });
 
 }

};

export default ServerActions;
