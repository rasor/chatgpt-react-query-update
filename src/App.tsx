import { QueryClient, QueryClientProvider, useMutation, useQuery } from 'react-query';
import './App.css';

interface IItem {
  id: number;
  name: string;
}

const queryClient = new QueryClient();

const fetchItemList = async (): Promise<IItem[]> => {
  const response = await fetch('/api/items');
  const data: IItem[] = await response.json();
  return data;
};

const updateItem = async (itemId: number, updatedData: Partial<IItem>): Promise<IItem> => {
  const response = await fetch(`/api/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data: IItem = await response.json();
  return data;
};

const ItemList = (): JSX.Element => {
  const { data: items } = useQuery<IItem[]>('itemList', fetchItemList);

  if (!items) {
    return <div>Loading...</div>;
  }

  const updateItemInList = (itemId: number, updatedData: Partial<IItem>): void => {
    queryClient.setQueryData<IItem[]>('itemList', (prevItems: IItem[] | undefined): IItem[] => {
      if (prevItems) {
        const updatedItems = prevItems.map((item) =>
          item.id === itemId ? { ...item, ...updatedData } : item
        );
        return updatedItems;
      }
      return prevItems!;
    });
  };

  return (
    <div>
      {items.map((item) => (
        <Item key={item.id} item={item} updateItemInList={updateItemInList} />
      ))}
    </div>
  );
};

interface ItemProps {
  item: IItem;
  updateItemInList: (itemId: number, updatedData: Partial<IItem>) => void;
}
const Item = ({ item, updateItemInList }: ItemProps): JSX.Element => {
  const { mutate } = useMutation<IItem, unknown, Partial<IItem>>((updatedData) =>
    updateItem(item.id, updatedData)
  );

  const handleUpdate = (itemId: number): void => {
    const updatedData: Partial<IItem> = { id: itemId, name: 'Updated Name' };
    // Update backend
    const resp = mutate(updatedData);
    // Update frontend if BE ok
    updateItemInList(itemId, updatedData);
  };

  return (
    <div>
      {item.name}
      <button onClick={() => handleUpdate(item.id)}>Update</button>
    </div>
  );
};

function App() {
  return (
    <>
      <div>
        <a href='https://chat.openai.com/share/6b153c63-decb-482c-8b51-8464515e2a33'>Code from chatGpt</a>
      </div>
      <div>
        <a href='https://tanstack.com/query/v3/docs/react/reference/QueryClient#queryclientsetquerydata'>Docs on queryClient.setQueryData()</a>
      </div>
      <QueryClientProvider client={queryClient}>
        <ItemList />
      </QueryClientProvider>
    </>
  );
}

export default App;
