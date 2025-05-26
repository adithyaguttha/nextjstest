import { FiX, FiPhone, FiMail } from 'react-icons/fi';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  developerName: string;
  developerPhone: string;
}

export default function ContactModal({
  isOpen,
  onClose,
  projectName,
  developerName,
  developerPhone,
}: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Contact Developer
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Project</h4>
              <p className="text-gray-900">{projectName}</p>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Developer</h4>
              <p className="text-gray-900">{developerName}</p>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <a
                href={`tel:${developerPhone}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <FiPhone className="w-5 h-5 text-[#044ca3]" />
                <span className="text-gray-900">{developerPhone}</span>
              </a>

              <a
                href={`mailto:${developerPhone}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <FiMail className="w-5 h-5 text-[#044ca3]" />
                <span className="text-gray-900">Send Email</span>
              </a>
            </div>

            {/* Note */}
            <div className="mt-6 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                Feel free to contact the developer directly for more information about this project.
                They will be happy to assist you with any questions you may have.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 