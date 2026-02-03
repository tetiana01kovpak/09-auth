import type { Note, NoteTag } from "@/types/note";
import type { User } from "@/types/user";
import { cookies } from "next/headers";
import { api } from "./api";
import type { AxiosResponse } from "axios";

interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: NoteTag | "All";
}

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

async function getHeaders() {
  const cookieStore = await cookies();
  return {
    Cookie: cookieStore.toString(),
  };
}

export const fetchNotes = async (
  params: FetchNotesParams
): Promise<FetchNotesResponse> => {
  const headers = await getHeaders();
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.perPage) searchParams.set("perPage", String(params.perPage));
  if (params.search) searchParams.set("search", params.search);
  if (params.tag && params.tag !== "All") searchParams.set("tag", params.tag);

  const response = await api.get<FetchNotesResponse>(
    `/notes?${searchParams.toString()}`,
    { headers }
  );

  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const headers = await getHeaders();
  const response = await api.get<Note>(`/notes/${id}`, { headers });

  return response.data;
};

export const getMe = async (): Promise<User> => {
  const headers = await getHeaders();
  const response = await api.get<User>("/users/me", { headers });

  return response.data;
};

export const checkSession = async (): Promise<AxiosResponse<{ success: boolean }>> => {
  const headers = await getHeaders();
  const response = await api.get<{ success: boolean }>("/auth/session", { headers });

  return response;
};
