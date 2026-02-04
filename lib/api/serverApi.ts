import type { Note, NoteTag } from "@/types/note";
import type { User } from "@/types/user";
import { cookies } from "next/headers";

const baseURL = process.env.NEXT_PUBLIC_API_URL + "/api";

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

  const response = await fetch(`${baseURL}/notes?${searchParams.toString()}`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }

  return response.json();
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const headers = await getHeaders();
  const response = await fetch(`${baseURL}/notes/${id}`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch note");
  }

  return response.json();
};

export const getMe = async (): Promise<User> => {
  const headers = await getHeaders();
  const response = await fetch(`${baseURL}/users/me`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
};

export const checkSession = async (): Promise<{ success: boolean }> => {
  const headers = await getHeaders();
  const response = await fetch(`${baseURL}/auth/session`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    return { success: false };
  }

  return response.json();
};
