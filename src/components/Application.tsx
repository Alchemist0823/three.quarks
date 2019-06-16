import * as React from "react";
import {
    Container,
    Divider,
    Dropdown,
    Grid,
    Header,
    List,
    Menu,
    Segment,
    Image,
    Icon,
    Input,
    MenuItemProps, DropdownItemProps, Sidebar
} from "semantic-ui-react";
import {MainMenu} from "./MainMenu";
import {ThreejsViewport} from "./ThreejsViewport";
import {PropertiesEditor} from "./PropertiesEditor";

interface ApplicationProps {
}

interface ApplicationStates {
    activeItem: string
}

export class Application extends React.Component<ApplicationProps, ApplicationStates> {
    handleItemClick = (e: React.MouseEvent, { name }: DropdownItemProps) => this.setState({ activeItem: name! });

    constructor(props: Readonly<ApplicationProps>) {
        super(props);
        this.state = {
            activeItem: ""
        }
    }

    render() {
        const { activeItem } = this.state;

        return (
            <div>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <MainMenu></MainMenu>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                        <Grid.Column width={10}>
                            <ThreejsViewport width={600} height={600} />
                        </Grid.Column>
                        <Grid.Column width={6}>
                            <PropertiesEditor />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>);
    }
}