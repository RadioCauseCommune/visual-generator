
import React from 'react';
import { TEMPLATES } from '../../services/templates';

interface TemplateSelectorProps {
    onSelectTemplate: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate }) => {
    return (
        <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map(template => (
                <button
                    key={template.id}
                    onClick={() => {
                        if (confirm(`Appliquer le template "${template.label}" ? Cela remplacera vos calques actuels.`)) {
                            onSelectTemplate(template.id);
                        }
                    }}
                    className="flex flex-col items-center justify-center p-3 neo-border-fine bg-white neo-hover neo-active text-center group"
                >
                    <span className="font-syne font-black text-[10px] uppercase group-hover:text-[#D20A33] transition-colors">{template.label}</span>
                    <span className="text-[7px] font-bold text-gray-500 leading-tight mt-1">{template.description}</span>
                </button>
            ))}
        </div>
    );
};

export default TemplateSelector;
