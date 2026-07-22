import fs from 'node:fs';

const path = new URL('../src/App.tsx', import.meta.url);
let source = fs.readFileSync(path, 'utf8');

function replaceOnce(oldText, newText, label) {
  if (source.includes(newText)) return;
  if (!source.includes(oldText)) {
    throw new Error(`Unable to apply ${label}: source marker not found.`);
  }
  source = source.replace(oldText, newText);
}

replaceOnce(
  "import React, { useState, useEffect, useMemo } from 'react';",
  "import React, { useState, useEffect, useMemo, useRef } from 'react';",
  'React useRef import',
);

replaceOnce(
  "  const [isSigningIn, setIsSigningIn] = useState(false);",
  `  const [isSigningIn, setIsSigningIn] = useState(false);\n  const [isSavingItem, setIsSavingItem] = useState(false);\n  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);\n  const itemSaveLockRef = useRef(false);`,
  'financial action state',
);

const oldAddItem = `  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    if (data.amount) data.amount = Number(data.amount);
    if (data.day_of_month) data.day_of_month = Number(data.day_of_month);
    if (data.target_amount) data.target_amount = Number(data.target_amount);
    if (data.is_completed !== undefined) data.is_completed = data.is_completed === 'on';

    let collectionName = '';
    if (modalType === 'income') collectionName = 'incomes';
    else if (modalType === 'expense') collectionName = 'fixedExpenses';
    else if (modalType === 'goal') collectionName = 'goals';
    else collectionName = 'events';

    try {
      const colRef = collection(db, 'users', user.uid, collectionName);
      if (editingItem) {
        await setDoc(doc(colRef, editingItem.id), data, { merge: true });
      } else {
        await setDoc(doc(colRef), data);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, \`users/\${user.uid}/\${collectionName}\`);
    }
  };`;

const newAddItem = `  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || itemSaveLockRef.current) return;

    itemSaveLockRef.current = true;
    setIsSavingItem(true);
    setActionMessage(null);

    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    if (data.amount) data.amount = Number(data.amount);
    if (data.day_of_month) data.day_of_month = Number(data.day_of_month);
    if (data.target_amount) data.target_amount = Number(data.target_amount);
    if (data.is_completed !== undefined) data.is_completed = data.is_completed === 'on';

    let collectionName = '';
    if (modalType === 'income') collectionName = 'incomes';
    else if (modalType === 'expense') collectionName = 'fixedExpenses';
    else if (modalType === 'goal') collectionName = 'goals';
    else collectionName = 'events';

    try {
      const colRef = collection(db, 'users', user.uid, collectionName);
      if (editingItem) {
        await setDoc(doc(colRef, editingItem.id), data, { merge: true });
      } else {
        await setDoc(doc(colRef), data);
      }
      setActionMessage({ type: 'success', text: editingItem ? 'Changes saved.' : 'Item added.' });
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Unable to save financial item:', error);
      setActionMessage({ type: 'error', text: 'Could not save. Check your connection and try again.' });
    } finally {
      itemSaveLockRef.current = false;
      setIsSavingItem(false);
    }
  };`;

replaceOnce(oldAddItem, newAddItem, 'duplicate-safe item save');

const oldDelete = `  const handleDelete = async (type: 'income' | 'expense' | 'event' | 'goal', id: string) => {
    if (!user) return;
    let collectionName = '';
    if (type === 'income') collectionName = 'incomes';
    else if (type === 'expense') collectionName = 'fixedExpenses';
    else if (type === 'goal') collectionName = 'goals';
    else collectionName = 'events';

    try {
      await deleteDoc(doc(db, 'users', user.uid, collectionName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, \`users/\${user.uid}/\${collectionName}/\${id}\`);
    }
  };`;

const newDelete = `  const handleDelete = async (type: 'income' | 'expense' | 'event' | 'goal', id: string) => {
    if (!user) return;
    if (!window.confirm('Delete this item? This action cannot be undone.')) return;

    let collectionName = '';
    if (type === 'income') collectionName = 'incomes';
    else if (type === 'expense') collectionName = 'fixedExpenses';
    else if (type === 'goal') collectionName = 'goals';
    else collectionName = 'events';

    setActionMessage(null);
    try {
      await deleteDoc(doc(db, 'users', user.uid, collectionName, id));
      setActionMessage({ type: 'success', text: 'Item deleted.' });
    } catch (error) {
      console.error('Unable to delete financial item:', error);
      setActionMessage({ type: 'error', text: 'Could not delete. Check your connection and try again.' });
    }
  };`;

replaceOnce(oldDelete, newDelete, 'confirmed item deletion');

replaceOnce(
  `              <div className="pt-4">\n                <button type="submit" className={cn(`,
  `              {actionMessage?.type === 'error' && (\n                <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">\n                  {actionMessage.text}\n                </p>\n              )}\n\n              <div className="pt-4">\n                <button type="submit" disabled={isSavingItem} className={cn(`,
  'modal error feedback and disabled save',
);

replaceOnce(
  `                  <Save size={20} /> {editingItem ? 'Save Changes' : 'Add Item'}\n                </button>`,
  `                  {isSavingItem ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}\n                  {isSavingItem ? 'Saving…' : editingItem ? 'Save Changes' : 'Add Item'}\n                </button>`,
  'saving button label',
);

replaceOnce(
  `      {/* Modal */}`,
  `      {actionMessage?.type === 'success' && (\n        <div role="status" className="fixed top-20 left-1/2 z-[70] -translate-x-1/2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-2xl">\n          {actionMessage.text}\n        </div>\n      )}\n\n      {/* Modal */}`,
  'success notification',
);

fs.writeFileSync(path, source);
console.log('Financial action hardening applied.');
