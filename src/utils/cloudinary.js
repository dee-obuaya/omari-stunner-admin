import { Cloudinary } from '@cloudinary/url-gen';

const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const cld = new Cloudinary({
	cloud: {
		cloudName: cloudinaryCloudName,
	},
});

export default cld;
