import { useEffect } from 'react'

/**
 * Sets the document title (browser tab title) for the page.
 * Usage: <PageTitle title="Browse Tickets" />
 */
export default function PageTitle({ title }) {
  useEffect(() => {
    document.title = title ? `${title} | Smart Campus` : 'Smart Campus';
  }, [title]);
  return null;
}
