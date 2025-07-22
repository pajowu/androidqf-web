import { store } from './state';
import { Provider } from 'react-redux';
import { Stepper } from './components/stepper';
import { SelectDevice } from './pages/SelectDevice';
import { ModuleSettings } from './pages/ModuleSettings';
import { AppContainer } from './components/AppContainer';
import { Heading1 } from './components/typography';
import { GeneralSettings } from './pages/GeneralSettings';
import { PropsWithChildren } from 'react';
import { Link } from './components/Link';

function WebUSBSupported(props: PropsWithChildren) {
	if ('usb' in navigator) {
		return props.children;
	}
}

function WebUSBNotSupported(props: PropsWithChildren) {
	if (!('usb' in navigator)) {
		return props.children;
	}
}
export function App(): JSX.Element {
	return (
		<Provider store={store}>
			<AppContainer>
				<Heading1 className="mb-4">Android QF</Heading1>
				<WebUSBSupported>
					<Stepper steps={[SelectDevice, GeneralSettings, ModuleSettings]} />
				</WebUSBSupported>
				<WebUSBNotSupported>
					Your browser does not support WebUSB. To use this site, please switch to a{' '}
					<Link href="https://caniuse.com/webusb">browser with WebUSB support.</Link>
				</WebUSBNotSupported>
			</AppContainer>
		</Provider>
	);
}
