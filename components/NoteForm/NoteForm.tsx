"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { NoteTag } from "../../types/note";
import { noteTags } from "../../types/note";
import { createNote } from "../../lib/api";
import type { CreateNotePayload } from "../../lib/api";
import { useNoteStore } from "../../lib/store/noteStore";
import type { Draft } from "../../lib/store/noteStore";
import css from "./NoteForm.module.css";

export interface NoteFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function NoteForm({ onCancel, onSuccess }: NoteFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const draft = useNoteStore((state) => state.draft);
  const setDraft = useNoteStore((state) => state.setDraft);
  const clearDraft = useNoteStore((state) => state.clearDraft);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateNotePayload, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: (values: CreateNotePayload) => createNote(values),
  });

  const validateForm = (values: Draft): boolean => {
    const newErrors: typeof errors = {};

    if (!values.title || values.title.length < 3 || values.title.length > 50) {
      newErrors.title = "Title must be between 3 and 50 characters";
    }

    if (values.content && values.content.length > 500) {
      newErrors.content = "Content must not exceed 500 characters";
    }

    if (!values.tag) {
      newErrors.tag = "Tag is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setDraft({ [name]: value } as Partial<CreateNotePayload>);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm(draft)) {
      setIsSubmitting(false);
      return;
    }

    try {
      await mutation.mutateAsync(draft as CreateNotePayload);
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      clearDraft();
      onSuccess?.();
      if (!onSuccess) {
        router.back();
      }
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          className={css.input}
          value={draft.title}
          onChange={handleChange}
        />
        {errors.title && <span className={css.error}>{errors.title}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          value={draft.content}
          onChange={handleChange}
        />
        {errors.content && <span className={css.error}>{errors.content}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          value={draft.tag}
          onChange={handleChange}
        >
          {noteTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        {errors.tag && <span className={css.error}>{errors.tag}</span>}
      </div>

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={css.submitButton}
          disabled={mutation.isPending || isSubmitting}
        >
          Create note
        </button>
      </div>
    </form>
  );
}
