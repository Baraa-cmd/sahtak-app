import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDoc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Pharmacy, Nurse, Hospital, AppUser, AppUpdateInfo, CommunityReport, RatingReview } from '../types';
import { INITIAL_PHARMACIES, INITIAL_NURSES, INITIAL_HOSPITALS } from './initialData';
import { offlineStorage, DEFAULT_ADMIN_USER } from './offlineStorage';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Helper to sanitize objects and strip undefined properties before Firestore writes
export function cleanUndefined<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Test connection on boot per Firebase skill guidelines & auto-seed Dayr Hafir data
export async function testConnection() {
  try {
    await getDoc(doc(db, 'test', 'connection')).catch(() => null);
  } catch (error) {
    console.warn('Firebase connection check:', error);
  }
  // Auto-seed initial data to Firestore if database is fresh
  seedInitialDataIfEmpty().catch((err) => console.warn('Auto-seed check:', err));
}
testConnection();

// Initial database seeding with Dayr Hafir data (Runs only once and never resurrects deleted items)
export async function seedInitialDataIfEmpty(force = false) {
  try {
    const systemDoc = await getDoc(doc(db, 'system', 'dayr_hafir_seeded_v1')).catch(() => null);

    if (!force && systemDoc && systemDoc.exists()) {
      // System was already initialized once in Firestore. Never re-seed or resurrect deleted records!
      return;
    }

    const deletedIds = offlineStorage.getDeletedIds();

    // Seed pharmacies (excluding deleted ones)
    for (const ph of INITIAL_PHARMACIES) {
      if (!deletedIds.includes(ph.id)) {
        await setDoc(doc(db, 'pharmacies', ph.id), cleanUndefined({
          ...ph,
          updatedAt: new Date().toISOString()
        }), { merge: true });
      }
    }

    // Seed nurses (excluding deleted ones)
    for (const nr of INITIAL_NURSES) {
      if (!deletedIds.includes(nr.id)) {
        await setDoc(doc(db, 'nurses', nr.id), cleanUndefined({
          ...nr,
          updatedAt: new Date().toISOString()
        }), { merge: true });
      }
    }

    // Seed hospitals (excluding deleted ones)
    for (const hp of INITIAL_HOSPITALS) {
      if (!deletedIds.includes(hp.id)) {
        await setDoc(doc(db, 'hospitals', hp.id), cleanUndefined({
          ...hp,
          updatedAt: new Date().toISOString()
        }), { merge: true });
      }
    }

    // Seed default admin account
    await setDoc(doc(db, 'app_users', DEFAULT_ADMIN_USER.id), cleanUndefined({
      ...DEFAULT_ADMIN_USER,
      updatedAt: new Date().toISOString()
    }), { merge: true });

    // Mark system as permanently initialized
    await setDoc(doc(db, 'system', 'dayr_hafir_seeded_v1'), {
      seeded: true,
      seededAt: new Date().toISOString(),
      dataset: 'dayr_hafir_v1'
    });

    console.log('Dayr Hafir data seeded permanently to Firestore.');
  } catch (err) {
    console.warn('Initial seed skipped or offline:', err);
  }
}

// Manual reset / restore function callable by Admin if desired
export async function restoreDefaultSeedData(): Promise<void> {
  await seedInitialDataIfEmpty(true);
  offlineStorage.savePharmacies(INITIAL_PHARMACIES);
  offlineStorage.saveNurses(INITIAL_NURSES);
  offlineStorage.saveHospitals(INITIAL_HOSPITALS);
}

// Subscribe to real-time changes in pharmacies
export function subscribeToPharmacies(
  onData: (data: Pharmacy[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'pharmacies';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const deletedIds = offlineStorage.getDeletedIds();
      const items: Pharmacy[] = [];
      snapshot.forEach((docSnap) => {
        if (!deletedIds.includes(docSnap.id)) {
          items.push({ id: docSnap.id, ...docSnap.data() } as Pharmacy);
        }
      });
      onData(items);
      offlineStorage.savePharmacies(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      // Fallback to offline cache
      const deletedIds = offlineStorage.getDeletedIds();
      const cached = offlineStorage.getPharmacies();
      const fallback = cached !== null ? cached : [];
      const filtered = fallback.filter(p => !deletedIds.includes(p.id));
      onData(filtered);
      if (onError) onError(error);
    }
  );
}

// Subscribe to real-time changes in nurses
export function subscribeToNurses(
  onData: (data: Nurse[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'nurses';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const deletedIds = offlineStorage.getDeletedIds();
      const items: Nurse[] = [];
      snapshot.forEach((docSnap) => {
        if (!deletedIds.includes(docSnap.id)) {
          items.push({ id: docSnap.id, ...docSnap.data() } as Nurse);
        }
      });
      onData(items);
      offlineStorage.saveNurses(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      const deletedIds = offlineStorage.getDeletedIds();
      const cached = offlineStorage.getNurses();
      const fallback = cached !== null ? cached : [];
      const filtered = fallback.filter(n => !deletedIds.includes(n.id));
      onData(filtered);
      if (onError) onError(error);
    }
  );
}

// Subscribe to real-time changes in hospitals
export function subscribeToHospitals(
  onData: (data: Hospital[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'hospitals';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const deletedIds = offlineStorage.getDeletedIds();
      const items: Hospital[] = [];
      snapshot.forEach((docSnap) => {
        if (!deletedIds.includes(docSnap.id)) {
          items.push({ id: docSnap.id, ...docSnap.data() } as Hospital);
        }
      });
      onData(items);
      offlineStorage.saveHospitals(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      const deletedIds = offlineStorage.getDeletedIds();
      const cached = offlineStorage.getHospitals();
      const fallback = cached !== null ? cached : [];
      const filtered = fallback.filter(h => !deletedIds.includes(h.id));
      onData(filtered);
      if (onError) onError(error);
    }
  );
}

// Update pharmacy duty status
export async function updatePharmacyStatus(
  pharmacyId: string,
  updates: Partial<Pharmacy>
) {
  const path = `pharmacies/${pharmacyId}`;
  const finalUpdates: Partial<Pharmacy> = {
    ...updates,
    updatedAt: new Date().toISOString()
  };

  if (updates.isOnDuty === true) {
    finalUpdates.lastDutyBroadcastAt = new Date().toISOString();
  }

  try {
    await updateDoc(doc(db, 'pharmacies', pharmacyId), cleanUndefined(finalUpdates));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    // If offline, still update local cache
    const current = offlineStorage.getPharmacies() || [];
    const updated = current.map((p) =>
      p.id === pharmacyId ? { ...p, ...finalUpdates } : p
    );
    offlineStorage.savePharmacies(updated);
    throw error;
  }
}

// Update nurse availability and duty status
export async function updateNurseStatus(
  nurseId: string,
  updates: Partial<Nurse>
) {
  const path = `nurses/${nurseId}`;
  try {
    await updateDoc(doc(db, 'nurses', nurseId), cleanUndefined({
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// Save or create pharmacy (Full CRUD)
export async function savePharmacy(pharmacy: Pharmacy): Promise<void> {
  const path = `pharmacies/${pharmacy.id}`;
  offlineStorage.unmarkDeleted(pharmacy.id);
  const data: Pharmacy = {
    ...pharmacy,
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'pharmacies', pharmacy.id), cleanUndefined(data), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
  const current = offlineStorage.getPharmacies() || [];
  const exists = current.some(p => p.id === pharmacy.id);
  const updated = exists ? current.map(p => p.id === pharmacy.id ? data : p) : [data, ...current];
  offlineStorage.savePharmacies(updated);
}

// Delete pharmacy (Full CRUD)
export async function deletePharmacyFromFirestore(pharmacyId: string): Promise<void> {
  const path = `pharmacies/${pharmacyId}`;
  offlineStorage.markAsDeleted(pharmacyId);
  try {
    await deleteDoc(doc(db, 'pharmacies', pharmacyId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
  const current = offlineStorage.getPharmacies() || [];
  const updated = current.filter(p => p.id !== pharmacyId);
  offlineStorage.savePharmacies(updated);
}

// Save or create nurse (Full CRUD)
export async function saveNurse(nurse: Nurse): Promise<void> {
  const path = `nurses/${nurse.id}`;
  offlineStorage.unmarkDeleted(nurse.id);
  const data: Nurse = {
    ...nurse,
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'nurses', nurse.id), cleanUndefined(data), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
  const current = offlineStorage.getNurses() || [];
  const exists = current.some(n => n.id === nurse.id);
  const updated = exists ? current.map(n => n.id === nurse.id ? data : n) : [data, ...current];
  offlineStorage.saveNurses(updated);
}

// Delete nurse (Full CRUD)
export async function deleteNurseFromFirestore(nurseId: string): Promise<void> {
  const path = `nurses/${nurseId}`;
  offlineStorage.markAsDeleted(nurseId);
  try {
    await deleteDoc(doc(db, 'nurses', nurseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
  const current = offlineStorage.getNurses() || [];
  const updated = current.filter(n => n.id !== nurseId);
  offlineStorage.saveNurses(updated);
}

// Save or create hospital (Full CRUD)
export async function saveHospital(hospital: Hospital): Promise<void> {
  const path = `hospitals/${hospital.id}`;
  offlineStorage.unmarkDeleted(hospital.id);
  const data: Hospital = {
    ...hospital,
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'hospitals', hospital.id), cleanUndefined(data), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
  const current = offlineStorage.getHospitals() || [];
  const exists = current.some(h => h.id === hospital.id);
  const updated = exists ? current.map(h => h.id === hospital.id ? data : h) : [data, ...current];
  offlineStorage.saveHospitals(updated);
}

// Delete hospital (Full CRUD)
export async function deleteHospitalFromFirestore(hospitalId: string): Promise<void> {
  const path = `hospitals/${hospitalId}`;
  offlineStorage.markAsDeleted(hospitalId);
  try {
    await deleteDoc(doc(db, 'hospitals', hospitalId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
  const current = offlineStorage.getHospitals() || [];
  const updated = current.filter(h => h.id !== hospitalId);
  offlineStorage.saveHospitals(updated);
}

// Subscribe to real-time changes in app users (Admin & providers)
export function subscribeToUsers(
  onData: (data: AppUser[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'app_users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        onData([DEFAULT_ADMIN_USER]);
        offlineStorage.saveUsers([DEFAULT_ADMIN_USER]);
        return;
      }
      const items: AppUser[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as AppUser);
      });
      // Ensure admin exists
      if (!items.some(u => u.role === 'admin')) {
        items.unshift(DEFAULT_ADMIN_USER);
      }
      onData(items);
      offlineStorage.saveUsers(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      const cached = offlineStorage.getUsers();
      onData(cached || [DEFAULT_ADMIN_USER]);
      if (onError) onError(error);
    }
  );
}

// Save or update user credentials (Admin can edit admin credentials or add/edit providers)
export async function saveUserAccount(user: AppUser): Promise<void> {
  const path = `app_users/${user.id}`;
  try {
    await setDoc(
      doc(db, 'app_users', user.id),
      cleanUndefined({
        ...user,
        updatedAt: new Date().toISOString()
      }),
      { merge: true }
    );
    // Also update offline cache
    const currentUsers = offlineStorage.getUsers();
    const updatedUsers = [
      user,
      ...currentUsers.filter((u) => u.id !== user.id)
    ];
    offlineStorage.saveUsers(updatedUsers);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    // Fallback save to local storage
    const currentUsers = offlineStorage.getUsers();
    const updatedUsers = [
      user,
      ...currentUsers.filter((u) => u.id !== user.id)
    ];
    offlineStorage.saveUsers(updatedUsers);
  }
}

// Delete user account
export async function deleteUserAccount(userId: string): Promise<void> {
  const path = `app_users/${userId}`;
  try {
    await deleteDoc(doc(db, 'app_users', userId));
    const currentUsers = offlineStorage.getUsers();
    offlineStorage.saveUsers(currentUsers.filter((u) => u.id !== userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    const currentUsers = offlineStorage.getUsers();
    offlineStorage.saveUsers(currentUsers.filter((u) => u.id !== userId));
  }
}

// Save or update app update info in Firestore for instant real-time sync across all users
export async function saveAppUpdateToFirestore(info: AppUpdateInfo): Promise<void> {
  const path = 'settings/appUpdate';
  try {
    await setDoc(
      doc(db, 'settings', 'appUpdate'),
      cleanUndefined({
        ...info,
        updatedAt: new Date().toISOString()
      }),
      { merge: true }
    );
    offlineStorage.saveAppUpdate(info);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    offlineStorage.saveAppUpdate(info);
  }
}

// Subscribe to real-time app update info from Firestore
export function subscribeToAppUpdate(
  onData: (info: AppUpdateInfo) => void,
  onError?: (err: unknown) => void
) {
  const path = 'settings/appUpdate';
  return onSnapshot(
    doc(db, 'settings', 'appUpdate'),
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AppUpdateInfo;
        onData(data);
        offlineStorage.saveAppUpdate(data);
      } else {
        const fallback = offlineStorage.getAppUpdate();
        onData(fallback);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      const fallback = offlineStorage.getAppUpdate();
      onData(fallback);
      if (onError) onError(error);
    }
  );
}

// Save community report directly to Firestore and local storage
export async function saveCommunityReportToFirestore(report: CommunityReport): Promise<void> {
  const path = `community_reports/${report.id}`;
  // Save to offline storage cache immediately
  offlineStorage.saveCommunityReport(report);
  try {
    await setDoc(doc(db, 'community_reports', report.id), cleanUndefined(report));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    console.warn('Could not save community report to Firestore remote, cached locally.', error);
  }
}

// Subscribe to real-time community reports from Firestore
export function subscribeToCommunityReports(
  onData: (data: CommunityReport[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'community_reports';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: CommunityReport[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as CommunityReport);
      });
      // Combine with local reports to ensure no lost reports
      const cached = offlineStorage.getCommunityReports();
      const combinedMap = new Map<string, CommunityReport>();
      cached.forEach(r => combinedMap.set(r.id, r));
      items.forEach(r => combinedMap.set(r.id, r));
      const combined = Array.from(combinedMap.values());
      // Sort newest first
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(combined);
      // Cache all
      combined.forEach(rep => offlineStorage.saveCommunityReport(rep));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      const cached = offlineStorage.getCommunityReports();
      onData(cached);
      if (onError) onError(error);
    }
  );
}

// Delete community report from Firestore and local storage
export async function deleteCommunityReportFromFirestore(reportId: string): Promise<void> {
  const path = `community_reports/${reportId}`;
  // Remove from local cache
  try {
    const cached = offlineStorage.getCommunityReports();
    const updated = cached.filter(r => r.id !== reportId);
    localStorage.setItem('sehatuk_community_reports_v1', JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not remove report from local storage:', e);
  }
  try {
    await deleteDoc(doc(db, 'community_reports', reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save rating / review to Firestore
export async function saveReviewToFirestore(review: RatingReview): Promise<void> {
  const path = `reviews/${review.id}`;
  try {
    await setDoc(doc(db, 'reviews', review.id), cleanUndefined(review));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
  offlineStorage.saveReview(review);
}

// Subscribe to real-time reviews from Firestore
export function subscribeToReviews(
  onData: (data: RatingReview[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'reviews';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: RatingReview[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as RatingReview);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(items);
      items.forEach(rev => offlineStorage.saveReview(rev));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      const cached = offlineStorage.getAllRatings();
      onData(cached);
      if (onError) onError(error);
    }
  );
}

// Delete review from Firestore
export async function deleteReviewFromFirestore(reviewId: string): Promise<void> {
  const path = `reviews/${reviewId}`;
  try {
    await deleteDoc(doc(db, 'reviews', reviewId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Clear all operational entities (Pharmacies, Hospitals, Nurses, Reports, Reviews)
export async function clearAllData(): Promise<void> {
  const collectionsToClear = [
    'pharmacies',
    'hospitals',
    'nurses',
    'community_reports',
    'reviews'
  ];

  for (const col of collectionsToClear) {
    try {
      const snap = await getDocs(collection(db, col));
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(db, col, docSnap.id)).catch(() => null);
      }
    } catch (err) {
      console.warn(`Could not clear collection ${col}:`, err);
    }
  }

  // Clear offline caches so all local counts and lists reset to 0
  offlineStorage.clearAllData();
}



