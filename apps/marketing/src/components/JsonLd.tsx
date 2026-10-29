import {
  jsonLdOrganization,
  jsonLdSoftwareApplication,
  jsonLdFaq,
  jsonLdBreadcrumb,
  jsonLdWebSite,
} from '../data/seo';

export function JsonLd() {
  const schemas = [
    jsonLdOrganization,
    jsonLdSoftwareApplication,
    jsonLdFaq,
    jsonLdBreadcrumb,
    jsonLdWebSite,
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
