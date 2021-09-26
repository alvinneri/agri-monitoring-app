import * as firebase from "firebase";
import "firebase/firestore";
import "firebase/storage";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDj_Qt_GEOcWJnGsCrv4Pragti7w3jLmtg",
  authDomain: "property-management-cc14d.firebaseapp.com",
  projectId: "property-management-cc14d",
  storageBucket: "property-management-cc14d.appspot.com",
  messagingSenderId: "270008126735",
  appId: "1:270008126735:web:b069174c3b0126bffc827a",
  measurementId: "G-CZXH72SZXP",
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const storage = firebase.storage();
export const db = firebase.firestore();
export default firebase;
