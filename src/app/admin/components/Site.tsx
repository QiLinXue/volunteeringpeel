// Library Imports
import * as React from 'react';
import { Menu } from 'semantic-ui-react';

// Component Imports
import Footer from '@app/common/components/Footer';
import LoadingDimmer from '@app/common/components/LoadingDimmer';

// Controller Imports
import Content from '@app/admin/controllers/Content';

interface SiteProps {
  loading: boolean;
  loadUser: () => void;
}

export default class Site extends React.Component<SiteProps> {
  public componentDidMount() {
    this.props.loadUser();
  }

  public render() {
    // if (this.props.user.status !== 'in' || this.props.user.user.user.role_id !== 3) return null;
    return (
      <>
        <LoadingDimmer loading={this.props.loading} />
        <Menu inverted fixed="top" stackable>
          <Menu.Item header>Volunteering Peel Admin</Menu.Item>
          <Menu.Item position="right">Back</Menu.Item>
        </Menu>
        <Content />
        <Footer />
      </>
    );
  }
}
