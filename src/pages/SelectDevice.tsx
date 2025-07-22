import { useCallback, useEffect, useState } from 'react';
import { Options, KeyStore, WebUsbTransport, AdbClient } from 'wadb';
import { reactHtmlWithClassname } from '../components';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { setClient } from '../state/client';
import { Heading2, Paragraph } from '../components/typography';
import { StepProps } from '../components/stepper';
import { Link } from '../components/Link';

const options: Options = {
	debug: true,
	useChecksum: true,
	dump: false,
	keySize: 2048,
};

// KeyStore that just stores the keys in memory until page reload
// There is no point in storing them longer as reconnecting to a device with a
// previously approved key does not work because the custom crypto library adb
// uses doesn't properly implement RSASSA-PKCS1-v1_5
class MemoryKeyStore implements KeyStore {
	private keys: CryptoKeyPair[] = [];
	async loadKeys(): Promise<CryptoKeyPair[]> {
		return this.keys;
	}

	async saveKey(key: CryptoKeyPair): Promise<void> {
		this.keys.push(key);
	}
}

const keyStore = new MemoryKeyStore();

export function SelectDevice({ setCanGoNext }: StepProps) {
	const client = useAppSelector((state) => state.client.client);
	const dispatch = useAppDispatch();
	useEffect(() => {
		setCanGoNext(client !== null);
	}, [client]);
	return (
		<StatusComponent
			setClient={async (newClient) => {
				await client?.disconnect();
				await newClient.connect();
				dispatch(setClient(newClient));
			}}
		/>
	);
}

const DeviceCard = reactHtmlWithClassname(
	'div',
	'p-4 rounded-lg border border-gray-200 dark:border-gray-400 hover:shadow-lg hover:scale-105 transition-all break-words',
);

function PairedDeviceCard({
	device,
	onClick,
	currentDevice,
}: {
	device: USBDevice;
	onClick: () => void;
	currentDevice: null | USBDevice;
}): JSX.Element {
	const client: AdbClient | null = useAppSelector((state) => state.client.client);

	const isCurrent = currentDevice === device;
	const isSelected = client?.transport.device == device;
	return (
		<DeviceCard
			className={isSelected ? 'font-bold bg-neutral-200 dark:bg-neutral-700' : ''}
			onClick={onClick}
		>
			<div>
				{device.manufacturerName} {device.productName}
			</div>
			{isCurrent && !isSelected ? <div>Please accept usb debugging on your device</div> : <></>}
			<div>{isSelected ? 'Selected' : ''}</div>
		</DeviceCard>
	);
}

function AddDeviceCard({
	onPaired,
}: {
	onPaired: (transport: WebUsbTransport) => void;
}): JSX.Element {
	return (
		<DeviceCard onClick={() => WebUsbTransport.open(options).then(onPaired)}>
			Add New Device
		</DeviceCard>
	);
}

function DeviceList({
	devices,
	selectDevice,
	onPaired,
	currentDevice,
}: {
	devices: USBDevice[];
	currentDevice: USBDevice | null;
	selectDevice: (device: USBDevice) => void;
	onPaired: (transport: WebUsbTransport) => void;
}): JSX.Element {
	return (
		<div className="grid grid-cols-2 gap-6">
			{devices.map((device) => (
				<PairedDeviceCard
					device={device}
					key={device.serialNumber}
					onClick={() => selectDevice(device)}
					currentDevice={currentDevice}
				/>
			))}
			<AddDeviceCard onPaired={onPaired} />
		</div>
	);
}

function StatusComponent({ setClient }: { setClient: (_a: AdbClient) => void }): JSX.Element {
	const [devices, setDevices] = useState([] as USBDevice[]);
	const [currentDevice, setCurrentDevice] = useState(null as USBDevice | null);
	const refreshDevices = useCallback(() => {
		console.log('refreshDevices');
		WebUsbTransport.findAdbDevices().then(setDevices);
	}, []);
	useEffect(() => {
		navigator.usb.addEventListener('connect', refreshDevices);
		navigator.usb.addEventListener('disconnect', refreshDevices);
		refreshDevices();
		return () => {
			navigator.usb.removeEventListener('connect', refreshDevices);
			navigator.usb.removeEventListener('disconnect', refreshDevices);
		};
	}, []);
	return (
		<>
			<Paragraph>
				Welcome to AndroidQF. The following steps will guide you through everything necessary to
				acquire an archive of forensically relevant data from your android device.
			</Paragraph>
			<Heading2 className="mb-4">Select Device</Heading2>
			<Paragraph>Please select the device from which data shall be gathered.</Paragraph>
			<Paragraph>
				Make sure that you have enabled USB debugging.{' '}
				<Link href="https://developer.android.com/studio/debug/dev-options#enable">
					You can find instructions on how to do so using this link.
				</Link>
			</Paragraph>
			<Paragraph>
				If you do not see your device in the list below, you might need to grant AndroidQF-Web
				permission to access it first. You can do so by clicking "Add New Device" and allowing
				access to your device in the browser popup.
			</Paragraph>

			<DeviceList
				devices={devices}
				selectDevice={(device: USBDevice) => {
					setCurrentDevice(device);
					WebUsbTransport.openDevice(device, options)
						.then((transport) => new AdbClient(transport, options, keyStore))
						.then((x) => {
							setClient(x);
						});
				}}
				currentDevice={currentDevice}
				onPaired={(transport: WebUsbTransport) => {
					setCurrentDevice(transport.device);
					refreshDevices();
					setClient(new AdbClient(transport, options, keyStore));
				}}
			/>
		</>
	);
}
