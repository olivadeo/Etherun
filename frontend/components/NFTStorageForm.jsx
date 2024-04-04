import { useState } from 'react';
import { NFTStorage } from 'nft.storage';
import { medicProofIPFS } from '@/constants';
const NFTStorageForm = () => {

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [nftUrl, setNftUrl] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) return;
        setUploading(true);

        try {
            const client = new NFTStorage({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweENlNEE4ODBGQUJCMzY4OTZhZUQxZGQzNDVjMEY3ZUJDOWEzQkQwOTYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcxMTAwOTA4Mzk2NywibmFtZSI6IkFMWVJBIn0.yi67qFZGgMZV3EzEROSbZa4kx6fbgoWhE0b55pBhH9Q' });
            const fileMetadata = await client.storeBlob(file);
            console.log(fileMetadata);
            const fileLogo = await fetch('./medic-proof.png'); 
            const image = await fileLogo.blob();

            const nftMedic = {
                image,
                name: 'RUNNER MEDICAL PROOF',
                description: 'Certificat medical',
                attributes: {
                    type: "Medical-proof",
                    ipfs: "ipfs://"+fileMetadata
                  }
                };
                console.log(nftMedic);

            const nftMedicMetadata = await client.store(nftMedic);
            console.log(nftMedicMetadata);
            setNftUrl(nftMedicMetadata.url);
          
        } catch (error) {
            console.error('Erreur lors du téléchargement du fichier :', error);
        } finally {
            setUploading(false);
        }
    };

    // Fonction pour gérer la sélection du fichier
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    return (
        <div>
            <h1>Upload de fichier vers nft.storage</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit" disabled={!file || uploading}>
                    {uploading ? 'Téléchargement en cours...' : 'Télécharger'}
                </button>
            </form>
            {nftUrl && (
                <div>
                    <h2>Fichier téléchargé :</h2>
                    <p>URL du NFT : <a href={nftUrl} target="_blank" rel="noreferrer">{nftUrl}</a></p>
                </div>
            )}
        </div>
    );
}


export default NFTStorageForm
