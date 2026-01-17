import type { EditorJSContent, EditorJSBlock } from '@/types';

interface EditorJSRendererProps {
  content: EditorJSContent;
}

export function EditorJSRenderer({ content }: EditorJSRendererProps) {
  // Safety check: ensure content has blocks array
  if (!content || !content.blocks || !Array.isArray(content.blocks)) {
    return (
      <div className="article-content">
        <p className="text-gray-500 italic">No content available</p>
      </div>
    );
  }

  return (
    <div className="article-content">
      {content.blocks.map((block, index) => (
        <Block key={block.id || index} block={block} />
      ))}
    </div>
  );
}

interface BlockProps {
  block: EditorJSBlock;
}

function Block({ block }: BlockProps) {
  switch (block.type) {
    case 'header':
      return <HeaderBlock data={block.data} />;
    case 'paragraph':
      return <ParagraphBlock data={block.data} />;
    case 'list':
      return <ListBlock data={block.data} />;
    case 'quote':
      return <QuoteBlock data={block.data} />;
    case 'code':
      return <CodeBlock data={block.data} />;
    case 'image':
      return <ImageBlock data={block.data} />;
    case 'delimiter':
      return <DelimiterBlock />;
    default:
      return null;
  }
}

// Header Block
function HeaderBlock({ data }: { data: EditorJSBlock['data'] }) {
  const level = data.level || 2;
  
  const levelStyles = {
    1: 'text-4xl font-serif font-bold text-gray-900 mt-12 mb-6',
    2: 'text-3xl font-serif font-bold text-gray-900 mt-10 mb-5',
    3: 'text-2xl font-serif font-semibold text-gray-900 mt-8 mb-4',
  };

  const className = levelStyles[level as keyof typeof levelStyles] || levelStyles[2];
  const html = { __html: data.text || '' };

  if (level === 1) {
    return <h1 className={className} dangerouslySetInnerHTML={html} />;
  } else if (level === 3) {
    return <h3 className={className} dangerouslySetInnerHTML={html} />;
  }
  return <h2 className={className} dangerouslySetInnerHTML={html} />;
}

// Paragraph Block
function ParagraphBlock({ data }: { data: EditorJSBlock['data'] }) {
  return (
    <p 
      className="text-gray-800 leading-relaxed mb-6 text-lg"
      dangerouslySetInnerHTML={{ __html: data.text || '' }}
    />
  );
}

// List Block
function ListBlock({ data }: { data: EditorJSBlock['data'] }) {
  const ListTag = data.style === 'ordered' ? 'ol' : 'ul';
  
  return (
    <ListTag className={`mb-6 space-y-2 ${data.style === 'ordered' ? 'list-decimal' : 'list-disc'} list-inside`}>
      {(data.items || []).map((item: any, index: number) => {
        // Handle both string items and object items with content property
        const itemContent = typeof item === 'string' ? item : (item?.content || item?.text || JSON.stringify(item));
        return (
          <li 
            key={index}
            className="text-gray-800 leading-relaxed text-lg pl-2"
            dangerouslySetInnerHTML={{ __html: itemContent }}
          />
        );
      })}
    </ListTag>
  );
}

// Quote Block
function QuoteBlock({ data }: { data: EditorJSBlock['data'] }) {
  return (
    <blockquote className="border-l-4 border-primary-500 pl-6 py-4 my-8 bg-gray-50 rounded-r-lg">
      <p 
        className="text-gray-900 font-serif text-xl italic leading-relaxed mb-0"
        dangerouslySetInnerHTML={{ __html: data.text || '' }}
      />
      {data.caption && (
        <footer className="text-gray-600 text-sm mt-2">— {data.caption}</footer>
      )}
    </blockquote>
  );
}

// Code Block
function CodeBlock({ data }: { data: EditorJSBlock['data'] }) {
  return (
    <div className="my-8 rounded-lg overflow-hidden border border-gray-800">
      {/* Code Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-gray-400">JavaScript</span>
      </div>
      
      {/* Code Content */}
      <pre className="bg-gray-900 p-6 overflow-x-auto">
        <code className="text-sm text-gray-100 font-mono leading-relaxed">
          {data.code || data.text || ''}
        </code>
      </pre>
    </div>
  );
}

// Image Block
function ImageBlock({ data }: { data: EditorJSBlock['data'] }) {
  if (!data.file?.url) return null;

  return (
    <figure className="my-10">
      <div className={`relative overflow-hidden rounded-xl ${data.withBorder ? 'border-2 border-gray-200' : ''} ${data.stretched ? 'w-full' : 'mx-auto'}`}>
        <img
          src={data.file.url}
          alt={data.caption || ''}
          className={`w-full h-auto ${data.withBackground ? 'bg-gray-100 p-4' : ''}`}
        />
      </div>
      {data.caption && (
        <figcaption className="text-center text-sm text-gray-600 mt-3 italic">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
}

// Delimiter Block
function DelimiterBlock() {
  return (
    <div className="flex items-center justify-center my-10">
      <div className="flex space-x-2">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
      </div>
    </div>
  );
}
