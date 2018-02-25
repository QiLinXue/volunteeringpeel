// Library Imports
import { LocationDescriptor } from 'history';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { Dispatch } from 'redux';

// App Imports
import { loadUser } from '@app/common/utilities';

import Site from '@app/admin/components/Site';

const mapStateToProps = (state: State) => ({
  loading: state.loading,
});

const mapDispatchToProps = (dispatch: Dispatch<State>) => ({
  loadUser: () => {
    loadUser(dispatch).then(success => {
      if (!success) window.location.replace('/');
    });
  },
});

// tslint:disable-next-line:variable-name
const SiteController = connect(mapStateToProps, mapDispatchToProps)(Site);

export default SiteController;