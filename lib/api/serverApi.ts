import type { Note, NoteTag } from "@/types/note";
import type { User } from "@/types/user";
import { cookies } from "next/headers";
import { api } from "./api";
import { AxiosResponse } from "axios";

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

  const searchParams: Record<string, string> = {};
  if (params.page) searchParams.page = String(params.page);
  if (params.perPage) searchParams.perPage = String(params.perPage);
  if (params.search) searchParams.search = params.search;
  if (params.tag && params.tag !== "All") searchParams.tag = params.tag;

  const response = await api.get<FetchNotesResponse>("/notes", {
    headers,
    params: searchParams,
  });

  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const headers = await getHeaders();

  const response = await api.get<Note>(`/notes/${id}`, {
    headers,
  });

  return response.data;
};

export const getMe = async (): Promise<User> => {
  const headers = await getHeaders();

  const response = await api.get<User>("/users/me", {
    headers,
  });

  return response.data;
};

export const checkSession = async (): Promise<AxiosResponse> => {
  const headers = await getHeaders();

  const response = await api.post("/auth/session", null, {
    headers,
  });

  return response;
};
