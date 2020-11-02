import {
  atomFamily,
  atom,
} from 'recoil';

// only used in DataSource Component --start
export const dataAtomFamily = atomFamily({
  key: "dataAtomFamily",
  default: []
});

export const definitionDataSourceAtom = atom({
  key: "definitionDataSourceAtom",
  default: {}
});
// only used in DataSource Component --end


// only used in Token Component --start
export const tokenFamily = atomFamily({
  key: `tokenFamily`,
  default: () => "",
});

export const definitionTokenAtom = atom({
  key: "definitionTokenAtom",
  default: {}
});

// only used in Token Component --end

// only used in Viz Component --start
export const definitionVizAtom = atom({
  key: "definitionVizAtom",
  default: {}
});

// only used in Viz Component --end


// only used in Form Component --start
export const definitionFormAtom = atom({
  key: "definitionFormAtom",
  default: {}
});

// only used in Form Component --end

export default null;