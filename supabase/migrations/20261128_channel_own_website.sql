-- Leads with no tracked source came straight to the Nest Vault website, so label them that way.
update public.leads set channel = 'Own website' where channel = 'Direct / unknown';
