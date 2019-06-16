import * as React from "react";
import {Accordion, Button, Checkbox, Form, Icon, Input, ItemProps, Radio, Select, TextArea} from "semantic-ui-react";

interface PropertiesEditorProps{

}
interface PropertiesEditorState{
    activeIndex: number;
    value: string;
}

export class PropertiesEditor extends React.Component<PropertiesEditorProps, PropertiesEditorState>{
    state = { activeIndex: 0, value: "1"};

    handleClick = (e: React.MouseEvent, titleProps: ItemProps) => {
        const { index } = titleProps;
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index;

        this.setState({ activeIndex: newIndex })
    };

    handleChange = (e: React.MouseEvent, { value }: ItemProps) => this.setState({ value })


    emitterOptions = [
        { key: 'af', value: 'af', text: 'Sphere Emitter' },
        { key: 'ax', value: 'ax', text: 'Cone Emitter' },
        { key: 'ad', value: 'ad', text: 'Donut Emitter' },
    ];

    options = [
        { key: 'm', text: 'Male', value: 'male' },
        { key: 'f', text: 'Female', value: 'female' },
        { key: 'o', text: 'Other', value: 'other' },
    ];


    render() {
        const { activeIndex, value } = this.state;
        return (
        <Accordion fluid styled>
            <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
                <Icon name='dropdown' />
                Emission
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 0}>
                <Form>
                    <Form.Group widths='equal'>
                        <Form.Field control={Input} label='First name' placeholder='First name' />
                        <Form.Field control={Input} label='Last name' placeholder='Last name' />
                        <Form.Field control={Select} label='Gender' options={this.options} placeholder='Gender' />
                    </Form.Group>
                    <Form.Group inline>
                        <label>Quantity</label>
                        <Form.Field
                            control={Radio}
                            label='One'
                            value='1'
                            checked={value === '1'}
                            onChange={this.handleChange}
                        />
                        <Form.Field
                            control={Radio}
                            label='Two'
                            value='2'
                            checked={value === '2'}
                            onChange={this.handleChange}
                        />
                        <Form.Field
                            control={Radio}
                            label='Three'
                            value='3'
                            checked={value === '3'}
                            onChange={this.handleChange}
                        />
                    </Form.Group>
                    <Form.Field control={TextArea} label='About' placeholder='Tell us more about you...' />
                    <Form.Field control={Checkbox} label='I agree to the Terms and Conditions' />
                    <Form.Field control={Button}>Submit</Form.Field>
                </Form>
                <p>
                    A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can
                    be found as a welcome guest in many households across the world.
                </p>
            </Accordion.Content>

            <Accordion.Title active={activeIndex === 1} index={1} onClick={this.handleClick}>
                <Icon name='dropdown' />
                Emission Shape
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 1}>

                <Select placeholder='Emitter' options={this.emitterOptions} />
                <p>
                    There are many breeds of dogs. Each breed varies in size and temperament. Owners often
                    select a breed of dog that they find to be compatible with their own lifestyle and
                    desires from a companion.
                </p>
            </Accordion.Content>

            <Accordion.Title active={activeIndex === 2} index={2} onClick={this.handleClick}>
                <Icon name='dropdown' />
                Renderer
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 2}>
                <p>
                    Three common ways for a prospective owner to acquire a dog is from pet shops, private
                    owners, or shelters.
                </p>
                <p>
                    A pet shop may be the most convenient way to buy a dog. Buying a dog from a private
                    owner allows you to assess the pedigree and upbringing of your dog before choosing to
                    take it home. Lastly, finding your dog from a shelter, helps give a good home to a dog
                    who may not find one so readily.
                </p>
            </Accordion.Content>
        </Accordion>);
    }
}