import { doc, setDoc, updateDoc, arrayUnion, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase.js';

// Função para fazer upload de uma LEI COMPLETA com ID personalizado
export async function uploadLawDocument(documentId, lawData) {
  const docRef = doc(db, 'vademecum', documentId); 
  const dataToSave = { ...lawData, dataCriacao: new Date(), dataAtualizacao: new Date() };
  try {
    await setDoc(docRef, dataToSave);
    return { success: true, id: documentId };
  } catch (error) {
    console.error("Erro ao salvar documento da lei:", error);
    return { success: false, error: error.message };
  }
}

// Função para adicionar um lote de questões a uma matéria
export async function batchUploadQuestoes(subjectId, questions) {
  const subjectDocRef = doc(db, 'quizzes', subjectId);
  try {
    await updateDoc(subjectDocRef, { questions: arrayUnion(...questions) });
    return { success: true, count: questions.length };
  } catch (error) {
    console.error("Erro no envio em lote de questões:", error);
    return { success: false, error: error.message };
  }
}

// ==================================================================
// NOVAS FUNÇÕES DE BACKUP E RESTORE
// ==================================================================

/**
 * Função para fazer backup de todas as coleções principais (vademecum e quizzes)
 */
export async function backupAllData() {
  try {
    const vadeMecumSnapshot = await getDocs(collection(db, 'vademecum'));
    const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));

    const backupData = {
      vademecum: {},
      quizzes: {},
      timestamp: new Date().toISOString()
    };

    vadeMecumSnapshot.forEach(doc => {
      backupData.vademecum[doc.id] = doc.data();
    });

    quizzesSnapshot.forEach(doc => {
      backupData.quizzes[doc.id] = doc.data();
    });

    return { success: true, data: backupData };
  } catch (error) {
    console.error("Erro ao criar backup:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Função para restaurar dados de um arquivo de backup.
 * ATENÇÃO: Esta ação sobrescreve os dados existentes.
 */
export async function restoreAllData(backupData) {
  if (!backupData.vademecum || !backupData.quizzes) {
    return { success: false, error: "Formato de arquivo de backup inválido." };
  }

  const batch = writeBatch(db);

  try {
    // Restaurar Vade Mecum
    for (const id in backupData.vademecum) {
      const docRef = doc(db, 'vademecum', id);
      batch.set(docRef, backupData.vademecum[id]);
    }

    // Restaurar Quizzes
    for (const id in backupData.quizzes) {
      const docRef = doc(db, 'quizzes', id);
      batch.set(docRef, backupData.quizzes[id]);
    }

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Erro ao restaurar backup:", error);
    return { success: false, error: error.message };
  }
}