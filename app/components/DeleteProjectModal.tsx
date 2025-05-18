import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

type DeletionStep = 'idle' | 'deleting_media' | 'media_deleted' | 'deleting_project' | 'project_deleted';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteMedia: boolean) => Promise<void>;
  projectName: string;
}

export default function DeleteProjectModal({ isOpen, onClose, onConfirm, projectName }: DeleteProjectModalProps) {
  const [deleteMedia, setDeleteMedia] = useState(true);
  const [deletionStep, setDeletionStep] = useState<DeletionStep>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setError(null);
      
      if (deleteMedia) {
        setDeletionStep('deleting_media');
        // Wait a bit to show the animation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDeletionStep('media_deleted');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setDeletionStep('deleting_project');
      await onConfirm(deleteMedia);
      setDeletionStep('project_deleted');
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        // Reset state after modal is closed
        setTimeout(() => {
          setDeletionStep('idle');
          setDeleteMedia(true);
          setError(null);
        }, 300);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the project');
      setDeletionStep('idle');
    }
  };

  const getStepMessage = () => {
    switch (deletionStep) {
      case 'deleting_media':
        return 'Deleting project media...';
      case 'media_deleted':
        return 'Media deleted successfully';
      case 'deleting_project':
        return 'Deleting project...';
      case 'project_deleted':
        return 'Project deleted successfully';
      default:
        return '';
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Delete Project
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{projectName}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                {deletionStep === 'idle' && (
                  <div className="mt-4">
                    <div className="flex items-center">
                      <input
                        id="delete-media"
                        name="delete-media"
                        type="checkbox"
                        checked={deleteMedia}
                        onChange={(e) => setDeleteMedia(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="delete-media" className="ml-2 block text-sm text-gray-900">
                        Delete all project media (images, floor plans, etc.)
                      </label>
                    </div>
                  </div>
                )}

                {deletionStep !== 'idle' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      <p className="text-sm text-gray-600">{getStepMessage()}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleConfirm}
                    disabled={deletionStep !== 'idle'}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onClose}
                    disabled={deletionStep !== 'idle'}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 