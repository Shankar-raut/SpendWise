import { useApi } from './useApi';
import { spendwiseApi } from '../api/spendwise';
import type { Friend } from '../types';

export function useFriends() {
  const { data: friends, isLoading, error, execute: refetch } = useApi(
    () => spendwiseApi.friends.list(),
    { immediate: true }
  );

  const createFriend = async (friend: { name: string; email: string }) => {
    const newFriend = await spendwiseApi.friends.create(friend);
    await refetch();
    return newFriend;
  };

  const deleteFriend = async (id: number) => {
    await spendwiseApi.friends.delete(id);
    await refetch();
  };

  return {
    friends: friends ?? [],
    isLoading,
    error,
    refetch,
    createFriend,
    deleteFriend
  };
}