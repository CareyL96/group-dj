import React from 'react';
import { connect } from 'react-redux';
import { updateView } from '../../../actions/viewActions';

const Navbar = ({ view, updateView }) => (
  <div className="navbar sidebar">
    <ul className="navbar-items">
      <li className={`navbar-item home-nav ${view === 'home' ? 'selected' : null}`} onClick={() => updateView('home')}>Home</li>
      <li className={`navbar-item recently-played-nav ${view === 'recently played' ? 'selected' : null}`} onClick={() => updateView('recently played')}>Recently Played</li>
      <li className={`navbar-item most-played-nav ${view === 'most played' ? 'selected' : null}`} onClick={() => updateView('most played')}>Most Played</li>
      <li className={`navbar-item my-songs-nav ${view === 'my songs' ? 'selected' : null}`} onClick={() => updateView('my songs')}>Songs</li>
    </ul>
  </div>
);

const mapStateToProps = state => ({
  view: state.view.pageHistory.item,
});
const mapDispatchToProps = dispatch => ({
  updateView: view => dispatch(updateView(view)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
