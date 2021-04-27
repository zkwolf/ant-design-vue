import { isRef, reactive, Ref, ref } from 'vue';

function useDraggableRow<T>(dataSource: Ref<T[]>) {
  let dragItem: T;
  let targItem: T;
  const dragging = ref<boolean>();
  const customRow = (record: T) => {
    const innerRow = reactive({
      draggable: true,
      ondrag() {
        dragItem = record;
      },
      ondrop() {
        targItem = record;
      },
      ondragstart() {
        dragging.value = true;
      },
      ondragend() {
        dragging.value = false;
        if (!isRef(dataSource)) {
          return;
        }
        if (dragItem !== targItem) {
          const dragItemIndex = dataSource.value.indexOf(dragItem);
          const targItemIndex = dataSource.value.indexOf(targItem);
          // 解构交换
          [dataSource.value[dragItemIndex], dataSource.value[targItemIndex]] = [
            dataSource.value[targItemIndex],
            dataSource.value[dragItemIndex],
          ];
        }
      },
      ondragover() {
        return false;
      },
    });

    return innerRow;
  };
  return {
    customRow,
    dataSource,
  };
}

export default useDraggableRow;
