-- Leads with no tracked source came straight to the Nest Vault website, so label them simply "Website".
update public.leads set channel = 'Website' where channel in ('Direct / unknown', 'Own website');
