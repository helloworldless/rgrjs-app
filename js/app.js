import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/Main';
import Relay from 'react-relay';

ReactDOM.render(<Main />, document.getElementById('root'));

//Test server-side transpilation of Relay query to object using schema introspection
console.log(
  Relay.QL`
    query Test {
      links {
        title
      }
    }
  `
);
