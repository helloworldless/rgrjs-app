import React from 'react';
import API from '../API';
import LinkStore from '../stores/LinkStore';
import PropTypes from 'prop-types';

let _getAppState = () => {
  return {links: LinkStore.getAll()};
};

export default class Main extends React.Component {
  static propTypes = {limit: PropTypes.number};
  static defaultProps = {limit: 3};

  //Stage-0 property
  state = _getAppState();

  componentDidMount() {
    API.fetchLinks();
    LinkStore.on("change", this.onChange);
  }
  componentWillUnmount() {
    LinkStore.removeListener("change", this.onChange);
  }

  //Use arrow function instead of manually binding onChange to this
  onChange = () => {
    console.log("4: In the view, onChange, will get app state using LinkStore.getALl()");
    this.setState(_getAppState());
  }
  render() {
    let links = this.state.links.slice(0, this.props.limit).map((link, i) => {
      return (
          <li key={link._id}>
            <a href={link.url}>{link.title}</a>
          </li>
      );
    });
    return(
      <div>
        <h3>Links</h3>
        <ul>
          {links}
        </ul>
      </div>
    )
  }
}

