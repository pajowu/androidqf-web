import { useCallback, useEffect, useState } from 'react';
import { Options, KeyStore, WebUsbTransport, AdbClient } from 'wadb';
import { reactHtmlWithClassname } from '../components';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { setClient } from '../state/client';
import { Heading2 } from '../components/headings';
import { StepProps } from '../components/stepper';

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
	'p-4 font-medium rounded-lg border border-gray-200 dark:border-gray-400 hover:shadow-lg hover:scale-105 transition-all break-words',
);

function PairedDeviceCard({
	device,
	onClick,
}: {
	device: USBDevice;
	onClick: () => void;
}): JSX.Element {
	const client: AdbClient | null = useAppSelector((state) => state.client.client);

	return (
		<DeviceCard onClick={onClick}>
			<div>
				{device.manufacturerName} {device.productName}
			</div>
			<div>{client?.transport.device == device ? 'Selected' : ''}</div>
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
			Add new Device
		</DeviceCard>
	);
}

function DeviceList({
	devices,
	selectDevice,
	onPaired,
}: {
	devices: USBDevice[];
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
				/>
			))}
			<AddDeviceCard onPaired={onPaired} />
		</div>
	);
}

function StatusComponent({ setClient }: { setClient: (_a: AdbClient) => void }): JSX.Element {
	const [devices, setDevices] = useState([] as USBDevice[]);
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
			<Heading2 className="mb-4">Select Device</Heading2>
			<DeviceList
				devices={devices}
				selectDevice={(device: USBDevice) => {
					WebUsbTransport.openDevice(device, options)
						.then((transport) => new AdbClient(transport, options, keyStore))
						.then(setClient);
				}}
				onPaired={(transport: WebUsbTransport) => {
					refreshDevices();
					setClient(new AdbClient(transport, options, keyStore));
				}}
			/>
		</>
	);
}
