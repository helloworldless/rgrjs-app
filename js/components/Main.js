import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay';
import Link from './Link';
import CreateLinkMutation from '../mutations/CreateLinkMutation';
import {debounce} from 'lodash';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.setVariables = debounce(this.props.relay.setVariables, 300);
  }
  search = (e) => {
    this.setVariables({ titleQuery: e.target.value });
  }
  setLimit = (e) => {
    let newLimit = Number(e.target.value);
    this.props.relay.setVariables({limit: newLimit});
  }
  handleSubmit = (e) => {
    e.preventDefault();
    Relay.Store.update(
      new CreateLinkMutation({
        title: this.refs.newTitle.value,
        url: this.refs.newUrl.value,
        store: this.props.store
      })    
    );
    this.refs.newTitle.value = "";
    this.refs.newUrl.value = "";
  }
  render() {
    let content = this.props.store.linkConnection.edges.map((edge, i) => {
      return (
          <Link key={edge.node.id} link={edge.node} />
      );
    });
    return(
      <div>
        <h1>Links App</h1>
        <form onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Title" ref="newTitle" />
          <input type="text" placeholder="Url" ref="newUrl"/>
          <button type="submit">Add</button>
        </form>
        <div>
          <input type="text" placeholder="Search" onChange={this.search} />
        </div>
        Limit Results: 
        <select value={this.props.relay.variables.limit} onChange={this.setLimit}>
          <option value="3">3</option>
          <option value="6">6</option>
          <option value="10">10</option>
          <option value="100">100</option>
        </select>
        <ul>
          {content}
        </ul>
      </div>
    );
  }
}

Main = Relay.createContainer(Main, {
  initialVariables: {
    limit: 100,
    titleQuery: ''
  },
  fragments: {
    store: () => Relay.QL`
      fragment on Store {
        id,
        linkConnection(first: $limit, titleQuery: $titleQuery) {
          edges {
            node {
              id,
              ${Link.getFragment('link')}
            }
          }

        }
      }
    `
  }
});

export default Main; 
