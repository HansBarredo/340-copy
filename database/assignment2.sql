INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'the small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

SELECT 
    inv_make, 
    inv_model, 
    classification_name
FROM 
    public.inventory
INNER JOIN 
    public.classification
ON 
    inventory.classification_id = classification.classification_id
WHERE 
    classification.classification_name = 'Sport';


update public.inventory
set
inv_image = replace(inv_image, '/images/', '/images/vehicles/'),
inv_thumbnail = replace(inv_thumbnail, '/images/', '/images/vehicles/');