-- Expand the private deal vault to common business document formats.
-- 25 MiB cap is enforced both here and in the server upload route.
update storage.buckets
set public = false,
    file_size_limit = 26214400,
    allowed_mime_types = array[
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',
      'application/rtf', 'text/plain', 'text/csv',
      'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'
    ]::text[]
where id = 'deal-vault';
