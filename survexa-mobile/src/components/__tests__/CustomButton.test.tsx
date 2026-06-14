import React from 'react';
import renderer, { act } from 'react-test-renderer';
import CustomButton from '../CustomButton';

describe('CustomButton component', () => {
  it('renders correctly with title', () => {
    let component: any;
    act(() => {
      component = renderer.create(
        <CustomButton title="Test Button" onPress={() => {}} />
      );
    });
    const tree = component.toJSON();
    expect(tree).toBeTruthy();
  });

  it('contains button title text', () => {
    let component: any;
    act(() => {
      component = renderer.create(
        <CustomButton title="Press Me" onPress={() => {}} />
      );
    });
    const root = component.root;
    const textInstance = root.findByType('Text');
    expect(textInstance.props.children).toBe('Press Me');
  });

  it('triggers onPress when clicked', () => {
    const onPressMock = jest.fn();
    let component: any;
    act(() => {
      component = renderer.create(
        <CustomButton title="Press Me" onPress={onPressMock} />
      );
    });
    const root = component.root;
    
    // Trigger pressing action inside act()
    const touchable = root.findByProps({ disabled: false });
    act(() => {
      touchable.props.onPress();
    });

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
