import { Fragment, useEffect, useState } from 'react';
import Version from './Version';
import Comment from './Comment';

const DrawerContent = ({ rightDrawerType, setCreateModal, setCreatePage }) => {
  const [component, setComponent] = useState(null);

  useEffect(() => {
    if (!rightDrawerType) return;
    if (rightDrawerType === 'comment') {
      setComponent(<Comment />);
    } else if (rightDrawerType === 'version') {
      setComponent(
        <Version
          setCreateModal={setCreateModal}
          setCreatePage={setCreatePage}
        />
      );
    }
  }, [rightDrawerType]);

  return <Fragment>{component}</Fragment>;
};

export default DrawerContent;
