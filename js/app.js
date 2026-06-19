const App = (() => {
  const LOCAL_STORAGE_KEY = 'family-tree-data';
  let state = createEmptyTree();
  let sessionPassword = null;

  function createEmptyTree() {
    return {
      tree_id: crypto.randomUUID(),
      tree_name: 'My Family Tree',
      members: []
    };
  }

  function generateId() {
    return crypto.randomUUID();
  }

  function getState() {
    return state;
  }

  function setState(newState) {
    state = newState;
  }

  function resetState() {
    state = createEmptyTree();
    sessionPassword = null;
  }

  function getMember(id) {
    return state.members.find(m => m.id === id) || null;
  }

  function addMember(data) {
    const member = {
      id: generateId(),
      nama: data.nama || '',
      tanggal_lahir: data.tanggal_lahir || '',
      father_id: data.father_id || null,
      mother_id: data.mother_id || null,
      spouse_id: data.spouse_id || null,
      pekerjaan: data.pekerjaan || '',
      pendidikan: data.pendidikan || '',
      hobi: data.hobi || '',
      status_perkawinan: data.status_perkawinan || '',
      agama: data.agama || '',
      catatan: data.catatan || ''
    };
    state.members.push(member);
    if (member.spouse_id) {
      const spouse = state.members.find(m => m.id === member.spouse_id);
      if (spouse) spouse.spouse_id = member.id;
    }
    return member;
  }

  function updateMember(id, data) {
    const idx = state.members.findIndex(m => m.id === id);
    if (idx === -1) return null;
    const old = state.members[idx];

    if (data.spouse_id !== undefined && data.spouse_id !== old.spouse_id) {
      if (old.spouse_id) {
        const ex = state.members.find(m => m.id === old.spouse_id);
        if (ex) ex.spouse_id = null;
      }
      if (data.spouse_id) {
        const nu = state.members.find(m => m.id === data.spouse_id);
        if (nu) nu.spouse_id = id;
      }
    }

    state.members[idx] = { ...old, ...data, id };
    return state.members[idx];
  }

  function deleteMember(id) {
    const member = state.members.find(m => m.id === id);
    if (member && member.spouse_id) {
      const spouse = state.members.find(m => m.id === member.spouse_id);
      if (spouse) spouse.spouse_id = null;
    }
    for (const m of state.members) {
      if (m.father_id === id) m.father_id = null;
      if (m.mother_id === id) m.mother_id = null;
      if (m.spouse_id === id) m.spouse_id = null;
    }
    state.members = state.members.filter(m => m.id !== id);
  }

  function getRelatives(id) {
    const member = getMember(id);
    if (!member) return { parents: [], siblings: [], spouse: null, children: [] };

    const parents = [];
    if (member.father_id) {
      const f = getMember(member.father_id);
      if (f) parents.push(f);
    }
    if (member.mother_id) {
      const m = getMember(member.mother_id);
      if (m) parents.push(m);
    }

    const siblings = state.members.filter(m =>
      m.id !== id &&
      ((member.father_id && m.father_id === member.father_id) ||
       (member.mother_id && m.mother_id === member.mother_id))
    );

    const spouse = member.spouse_id ? getMember(member.spouse_id) : null;

    const children = state.members.filter(m =>
      m.father_id === id || m.mother_id === id
    );

    return { parents, siblings, spouse, children };
  }

  function getCachedPassword() {
    return sessionPassword;
  }

  function setCachedPassword(pwd) {
    sessionPassword = pwd;
  }

  function hasLocalData() {
    return !!localStorage.getItem(LOCAL_STORAGE_KEY);
  }

  async function saveToLocal(password) {
    const data = JSON.stringify(state, null, 2);
    const encrypted = await CryptoEngine.encrypt(data, password);
    localStorage.setItem(LOCAL_STORAGE_KEY, encrypted);
    sessionPassword = password;
  }

  async function loadFromLocal(password) {
    const encrypted = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!encrypted) throw new Error('No saved data found');
    const decrypted = await CryptoEngine.decrypt(encrypted, password);
    const parsed = JSON.parse(decrypted);
    if (!parsed.tree_id || !Array.isArray(parsed.members)) {
      throw new Error('Invalid family tree data');
    }
    state = parsed;
    sessionPassword = password;
    return parsed;
  }

  function clearLocal() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    sessionPassword = null;
  }

  async function exportFile(password) {
    const data = JSON.stringify(state, null, 2);
    const encrypted = await CryptoEngine.encrypt(data, password);

    const blob = new Blob([encrypted], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.tree_name.replace(/\s+/g, '_')}.enc`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  async function importFile(file, password) {
    const text = await file.text();
    const decrypted = await CryptoEngine.decrypt(text, password);
    const parsed = JSON.parse(decrypted);

    if (!parsed.tree_id || !Array.isArray(parsed.members)) {
      throw new Error('Invalid family tree file format');
    }
    state = parsed;
    sessionPassword = null;
    return parsed;
  }

  async function mergeFile(file, password) {
    const text = await file.text();
    const decrypted = await CryptoEngine.decrypt(text, password);
    const parsed = JSON.parse(decrypted);

    if (!parsed.tree_id || !Array.isArray(parsed.members)) {
      throw new Error('Invalid family tree file format');
    }

    const existingIds = new Set(state.members.map(m => m.id));
    let mergedCount = 0;
    for (const m of parsed.members) {
      if (!existingIds.has(m.id)) {
        m._mergedFrom = parsed.tree_id;
        state.members.push(m);
        existingIds.add(m.id);
        mergedCount++;
      }
    }

    return { mergedTree: parsed, mergedCount };
  }

  return {
    getState, setState, resetState,
    getMember, addMember, updateMember, deleteMember,
    getRelatives, generateId,
    getCachedPassword, setCachedPassword,
    hasLocalData, saveToLocal, loadFromLocal, clearLocal,
    exportFile, importFile, mergeFile,
    get state() { return state; }
  };
})();
