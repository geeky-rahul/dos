import auth from '@react-native-firebase/auth';

// Lazily require Firestore at runtime to avoid Metro static resolution issues
function getFirestore() {
	// require is used so Metro attempts resolution at runtime from the running project
	// and can tolerate certain resolver edge-cases on Windows/OneDrive setups.
	// eslint-disable-next-line global-require
	const fs = require('@react-native-firebase/firestore');
	return fs && fs.default ? fs.default() : fs();
}

// Users collection: doc id = uid
const usersCol = () => getFirestore().collection('users');
const shopsCol = () => getFirestore().collection('shops');
const productsCol = () => getFirestore().collection('products');

async function createUserDoc(uid, email, role = 'user') {
	const docRef = usersCol().doc(uid);
	await docRef.set({ email, role }, { merge: true });
	return docRef.get();
}

async function getUserDoc(uid) {
	const snap = await usersCol().doc(uid).get();
	return snap.exists ? snap.data() : null;
}

async function createShopDoc(uid, shopData) {
	// shopData: { shopName, description, address, phone, category, openingTime, closingTime }
	console.log('firebase.createShopDoc: start', { uid, shopData });
	const op = (async () => {
		await shopsCol().doc(uid).set({ ...shopData, uid });
		return shopsCol().doc(uid).get();
	})();
	const timeout = new Promise((_, reject) =>
		setTimeout(() => reject(new Error('createShopDoc timeout')), 10000),
	);
	try {
		const res = await Promise.race([op, timeout]);
		console.log('firebase.createShopDoc: success', { uid });
		return res;
	} catch (e) {
		console.error('firebase.createShopDoc: error', e);
		throw e;
	}
}

async function getShopDoc(uid) {
	const snap = await shopsCol().doc(uid).get();
	return snap.exists ? snap.data() : null;
}

async function addProduct(product) {
	// product: { name, price, description, image, shopId }
	const docRef = await productsCol().add(product);
	return docRef.get();
}

export { auth, getFirestore as firestore, createUserDoc, getUserDoc, createShopDoc, getShopDoc, addProduct };
