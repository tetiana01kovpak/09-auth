import type { AxiosResponse } from "axios";
import type { Note, NoteTag } from "@/types/note";
import type { User } from "@/types/user";
import { api } from "./api";

// Auth types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

interface UpdateUserPayload {
  username?: string;
}

// Notes types
export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  tag: NoteTag;
}

// Auth functions
export const register = async (
  credentials: RegisterCredentials
): Promise<User> => {
  const response: AxiosResponse<User> = await api.post(
    "/auth/register",
    credentials
  );
  return response.data;
};

export const login = async (credentials: LoginCredentials): Promise<User> => {
  const response: AxiosResponse<User> = await api.post(
    "/auth/login",
    credentials
  );
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const checkSession = async (): Promise<{ success: boolean }> => {
  const response: AxiosResponse<{ success: boolean }> =
    await api.get("/auth/session");
  return response.data;
};

// User functions
export const getMe = async (): Promise<User> => {
  const response: AxiosResponse<User> = await api.get("/users/me");
  return response.data;
};

export const updateMe = async (payload: UpdateUserPayload): Promise<User> => {
  const response: AxiosResponse<User> = await api.patch("/users/me", payload);
  return response.data;
};

// Notes functions
export const fetchNotes = async (
  params: FetchNotesParams
): Promise<FetchNotesResponse> => {
  const response: AxiosResponse<FetchNotesResponse> = await api.get("/notes", {
    params,
  });
  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.get(`/notes/${id}`);
  return response.data;
};

export const createNote = async (payload: CreateNotePayload): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.post("/notes", payload);
  return response.data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.delete(`/notes/${id}`);
  return response.data;
};
