import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null, // No auth implementation requested yet, but standard for the pattern
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test_connection', 'ping'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

export interface SharedScriptData {
  name: string;
  roleIds: string[];
  customRoles?: any[];
}

export async function shareScript(data: SharedScriptData): Promise<string> {
  const scriptId = Math.random().toString(36).substring(2, 12);
  const path = `sharedScripts/${scriptId}`;
  try {
    await setDoc(doc(db, 'sharedScripts', scriptId), {
      ...data,
      createdAt: serverTimestamp()
    });
    return scriptId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return '';
  }
}

export async function getSharedScript(scriptId: string): Promise<SharedScriptData | null> {
  const path = `sharedScripts/${scriptId}`;
  try {
    const docSnap = await getDoc(doc(db, 'sharedScripts', scriptId));
    if (docSnap.exists()) {
      return docSnap.data() as SharedScriptData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}
