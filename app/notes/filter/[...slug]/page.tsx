import type { Metadata } from "next";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { NoteTag } from "../../../../types/note";
import { fetchNotes } from "../../../../lib/api";
import NotesClient from "./Notes.client";

const PER_PAGE = 12;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string[] }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const routeTag = resolvedParams.slug?.[0];
  const search =
    typeof resolvedSearchParams.search === "string"
      ? resolvedSearchParams.search
      : "";

  const tagDisplay = routeTag && routeTag !== "all" ? routeTag : "All Notes";
  const searchDisplay = search ? ` matching "${search}"` : "";

  return {
    title: `${tagDisplay}${searchDisplay} | NoteHub`,
    description: `Browse ${tagDisplay.toLowerCase()}${searchDisplay} in NoteHub. Organize and manage your notes by category.`,
    openGraph: {
      title: `${tagDisplay}${searchDisplay} | NoteHub`,
      description: `Browse ${tagDisplay.toLowerCase()}${searchDisplay} in NoteHub. Organize and manage your notes by category.`,
      url: `${BASE_URL}/notes/filter/${routeTag || "all"}`,
      images: [
        {
          url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
          width: 1200,
          height: 630,
          alt: "NoteHub",
        },
      ],
    },
  };
}

export default async function NotesByTagPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const pageParam = resolvedSearchParams.page;
  const searchParam = resolvedSearchParams.search;

  const page = typeof pageParam === "string" ? Number(pageParam) || 1 : 1;
  const search = typeof searchParam === "string" ? searchParam : "";

  const routeTag = resolvedParams.slug?.[0];
  const tag =
    routeTag && routeTag !== "all" ? (routeTag as NoteTag) : undefined;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", tag ?? "all", page, PER_PAGE, search],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        search: search.trim() || undefined,
        tag,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient
        key={tag ?? "all"}
        initialPage={page}
        initialSearch={search}
        initialTag={tag}
      />
    </HydrationBoundary>
  );
}
