import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  UploadCloud, 
  RefreshCw,
  ImageIcon,
  Loader2,
  FileCheck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const ProductManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock, uploadProductImage } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'available'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price' | 'date'>('date');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<'restock' | 'adjustment'>('restock');
  const [adjustNote, setAdjustNote] = useState('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Festive Hampers',
    description: '',
    mrp: 1499,
    retailPrice: 999, // Public selling price
    retailerPrice: 750, // Retailer special price
    resellerPrice: 799, // Reseller baseline price
    stockQuantity: 25,
    lowStockThreshold: 10,
    isVisible: true,
    isAvailable: true,
    tags: 'Handcrafted, Festive Special',
  });

  // Direct Image Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  // Filtered & Sorted products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0;
    if (stockFilter === 'out') matchesStock = p.stockQuantity <= 0;
    if (stockFilter === 'available') matchesStock = p.stockQuantity > p.lowStockThreshold;

    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'stock') return a.stockQuantity - b.stockQuantity;
    if (sortBy === 'price') return a.retailPrice - b.retailPrice;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      sku: `EMG-${Math.floor(100 + Math.random() * 900)}`,
      category: categories[0] || 'Festive Hampers',
      description: '',
      mrp: 1499,
      retailPrice: 999,
      retailerPrice: 750,
      resellerPrice: 799,
      stockQuantity: 25,
      lowStockThreshold: 10,
      isVisible: true,
      isAvailable: true,
      tags: 'Handcrafted, Eco-Friendly',
    });
    setEditingProduct(null);
    setSelectedFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setErrorMessage('');
    setSuccessMessage('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description,
      mrp: product.mrp,
      retailPrice: product.retailPrice,
      retailerPrice: product.retailerPrice || Math.round(product.retailPrice * 0.8),
      resellerPrice: product.resellerPrice || Math.round(product.retailPrice * 0.85),
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      isVisible: product.isVisible,
      isAvailable: product.isAvailable,
      tags: (product.tags || []).join(', '),
    });
    setExistingImages(product.images || []);
    setSelectedFiles([]);
    setImagePreviews([]);
    setErrorMessage('');
    setSuccessMessage('');
    setIsAddModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    
    // Check validation
    for (const file of files) {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type.toLowerCase())) {
        setErrorMessage(`Invalid file format: ${file.name}. Only JPG, JPEG, PNG, and WebP are allowed.`);
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage(`File too large: ${file.name} (exceeds 8MB).`);
        return;
      }
    }

    setErrorMessage('');
    setSelectedFiles(prev => [...prev, ...files]);

    // Create local preview URLs
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewPreview = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      setErrorMessage('Product title and SKU code are required.');
      return;
    }

    if (existingImages.length === 0 && selectedFiles.length === 0) {
      setErrorMessage('Please select at least one product photo to upload.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const uploadedUrls: string[] = [...existingImages];

      // Upload newly selected files
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const result = await uploadProductImage(file, (pct) => {
            setUploadProgress(Math.round(((i + pct / 100) / selectedFiles.length) * 100));
          });
          uploadedUrls.push(result.downloadUrl);
        }
        setIsUploading(false);
      }

      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category,
        description: formData.description.trim(),
        mrp: Number(formData.mrp),
        retailPrice: Number(formData.retailPrice),
        retailerPrice: Number(formData.retailerPrice),
        resellerPrice: Number(formData.resellerPrice),
        stockQuantity: Number(formData.stockQuantity),
        lowStockThreshold: Number(formData.lowStockThreshold),
        images: uploadedUrls,
        isVisible: formData.isVisible,
        isAvailable: formData.isAvailable,
        tags: tagsArray,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }

      setSuccessMessage('Product successfully saved to catalogue!');
      setTimeout(() => {
        setIsAddModalOpen(false);
        setEditingProduct(null);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to save product. Please check connection and try again.');
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleExecuteStockAdjust = async () => {
    if (!stockAdjustProduct) return;
    try {
      await adjustStock(stockAdjustProduct.id, adjustAmount, adjustReason, adjustNote);
      setStockAdjustProduct(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update stock');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the product catalogue?`)) {
      try {
        await deleteProduct(id);
      } catch (err) {
        console.error(err);
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Product Catalogue & Direct Photo Upload</h2>
          <p className="text-xs text-stone-500">
            Upload photos directly from mobile or desktop, manage 3-tier pricing (Public Retail, Retailer, Reseller), and stock levels.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
          />
        </div>

        {/* Category & Stock Filter */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e: any) => setStockFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium"
          >
            <option value="all">All Stock Statuses</option>
            <option value="available">In Stock & Healthy</option>
            <option value="low">Low Stock Alerts</option>
            <option value="out">Out of Stock</option>
          </select>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium"
          >
            <option value="date">Sort by Recent</option>
            <option value="name">Sort by Name</option>
            <option value="stock">Sort by Lowest Stock</option>
            <option value="price">Sort by Price</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3.5 pl-5">Product & SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Public Price / MRP</th>
                <th className="p-3.5">Retailer Price</th>
                <th className="p-3.5">Reseller Price</th>
                <th className="p-3.5">Stock Level</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((prod) => {
                const isLow = prod.stockQuantity <= prod.lowStockThreshold && prod.stockQuantity > 0;
                const isOut = prod.stockQuantity <= 0;

                return (
                  <tr key={prod.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover bg-stone-100 border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 truncate max-w-[180px]">{prod.name}</p>
                          <p className="text-[11px] font-mono text-stone-400">SKU: {prod.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">₹{prod.retailPrice}</div>
                      <div className="text-[11px] text-stone-400 line-through">MRP: ₹{prod.mrp}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-emerald-800">₹{prod.retailerPrice || prod.retailPrice}</div>
                      <div className="text-[10px] text-emerald-600">Saved: ₹{prod.retailPrice - (prod.retailerPrice || prod.retailPrice)}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-purple-800">₹{prod.resellerPrice}</div>
                      <div className="text-[10px] text-purple-600">Margin: ₹{prod.retailPrice - prod.resellerPrice}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          isOut ? 'bg-red-100 text-red-700' :
                          isLow ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {prod.stockQuantity} units
                        </span>
                        <button
                          onClick={() => {
                            setStockAdjustProduct(prod);
                            setAdjustAmount(10);
                          }}
                          className="p-1 hover:bg-stone-200 rounded text-stone-500 hover:text-stone-900"
                          title="Quick Adjust Stock"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => updateProduct(prod.id, { isVisible: !prod.isVisible })}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          prod.isVisible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500 border border-stone-200'
                        }`}
                      >
                        {prod.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{prod.isVisible ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal with Direct Image Upload */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 flex flex-col gap-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-stone-900">
                {editingProduct ? 'Edit Gift Product' : 'Add New Gift Product'}
              </h3>
              <p className="text-xs text-stone-500">
                Select photos directly from your phone/PC, set public & role prices, and manage inventory.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Kashmiri Saffron & Dry Fruits Gift Box"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Product SKU / ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="EMG-101"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="Festive Hampers, Eco & Tech, Home & Living"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe items in the hamper, packaging, craftsmanship, and materials..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 resize-none"
                />
              </div>

              {/* DIRECT PHOTO UPLOAD MODULE (No manual URL input) */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-emerald-800" />
                      <span>Direct Photo Upload (Phone / Computer)</span>
                    </h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Select photos directly from your phone gallery or files (JPG, PNG, WebP).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Select Photos</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-emerald-900 font-semibold">
                      <span>Uploading to Firebase Storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-700 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Previews Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {/* Existing images */}
                  {existingImages.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative group rounded-xl overflow-hidden aspect-square border border-emerald-300 bg-white">
                      <img src={url} alt="existing" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-sm"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.2 rounded">
                        Saved
                      </span>
                    </div>
                  ))}

                  {/* New pending previews */}
                  {imagePreviews.map((url, idx) => (
                    <div key={`preview-${idx}`} className="relative group rounded-xl overflow-hidden aspect-square border-2 border-emerald-600 bg-white shadow-2xs">
                      <img src={url} alt="new-preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewPreview(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-sm"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-emerald-800 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                        New
                      </span>
                    </div>
                  ))}

                  {/* Empty state prompt */}
                  {existingImages.length === 0 && imagePreviews.length === 0 && (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="col-span-2 sm:col-span-4 p-6 border-2 border-dashed border-emerald-300 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-100/40 transition-colors"
                    >
                      <ImageIcon className="w-8 h-8 text-emerald-600 mb-1" />
                      <p className="font-bold text-emerald-950 text-xs">Tap to choose photos from device</p>
                      <p className="text-[10px] text-emerald-700">Supports JPG, PNG, WebP up to 8MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3-Tier Pricing Configuration */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                  Role-Based Pricing Configuration (₹)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-stone-500 mb-1">MRP (Sticker)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-900 mb-1">Public Selling Price *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.retailPrice}
                      onChange={(e) => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-emerald-800 mb-1">Retailer Price *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.retailerPrice}
                      onChange={(e) => setFormData({ ...formData, retailerPrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg font-bold text-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-purple-800 mb-1">Reseller Price *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.resellerPrice}
                      onChange={(e) => setFormData({ ...formData, resellerPrice: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg font-bold text-purple-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-medium text-stone-600 mb-1">Available Stock Qty</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-600 mb-1">Low Stock Warning Alert</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Visibility */}
              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Handcrafted, Eco-Friendly, Bestseller"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      className="rounded text-emerald-800"
                    />
                    <span className="font-semibold text-stone-700">Product Status: Active (Live on Store)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{isSaving ? 'Uploading & Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Adjust Modal */}
      {stockAdjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">
              Adjust Stock: {stockAdjustProduct.name}
            </h3>
            <p className="text-xs text-stone-500">
              Current stock level: <span className="font-bold text-stone-800">{stockAdjustProduct.stockQuantity}</span> units.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Adjustment Amount (+ or - units)</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Reason for Adjustment</label>
                <select
                  value={adjustReason}
                  onChange={(e: any) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg"
                >
                  <option value="restock">New Stock Inflow (Restock)</option>
                  <option value="adjustment">Inventory Audit / Damage Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Audit Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Received shipment from supplier"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setStockAdjustProduct(null)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteStockAdjust}
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold"
                >
                  Save Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
