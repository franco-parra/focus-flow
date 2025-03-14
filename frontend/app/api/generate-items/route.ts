import { NextResponse } from "next/server";
import { HfInference, InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

interface Item {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  items: Item[];
  expanded?: boolean;
}

dotenv.config({ path: ".env.local" });

const HF_MODEL = process.env.HF_MODEL;
const HF_TOKEN = process.env.HF_TOKEN;

const MAX_RETRIES = 3;
const BASE_PROMPT =
  "Dada una tarea, genera una lista de entre 1 a 8 subtareas utilizando verbos en infinitivo que permitan resolverla.\nUsa textos con no más de 128 caracteres.";

const EXAMPLE_CONVERSATIONS = [
  { role: "user", content: `${BASE_PROMPT}\n\nTarea: Aprender inglés` },
  {
    role: "assistant",
    content: `["Aprender el alfabeto y la pronunciación", "Construir vocabulario básico", "Estudiar gramática", "Practicar la escucha", "Leer en inglés", "Escribir en inglés", "Hablar inglés", "Usar recursos"]`,
  },
  {
    role: "user",
    content: "Tarea: Ir de vacaciones a Torres del Paine, Chile",
  },
  {
    role: "assistant",
    content: `["Investigar y elegir fechas", "Reservar alojamiento", "Planificar transporte", "Definir itinerario", "Preparar equipo", "Comprar entradas", "Organizar comidas"]`,
  },
  { role: "user", content: "Tarea: Aprender el framework NextJS" },
  {
    role: "assistant",
    content: `["Aprender los fundamentos de React", "Configurar un entorno de desarrollo", "Explorar la estructura de un proyecto Next.js", "Aprender a crear páginas y enrutamiento", "Integrar datos y APIs"]`,
  },
];

function createMessages(task: Task) {
  const messages = [...EXAMPLE_CONVERSATIONS];
  messages.push({
    role: "user",
    content: task.description
      ? `Tarea: ${task.title} - ${task.description}`
      : `Tarea: ${task.title}`,
  });
  return messages;
}

export async function POST(req: Request) {
  try {
    const { task }: { task: Task } = await req.json();

    if (!HF_MODEL || !HF_TOKEN) {
      return NextResponse.json(
        {
          status: "error",
          message: "Hugging Face credentials are not configured",
        },
        { status: 500 }
      );
    }

    let attempt = 0;
    let lastError = null;

    while (attempt < MAX_RETRIES) {
      try {
        const hf = new InferenceClient(HF_TOKEN);
        const completion = await hf.chatCompletion({
          model: HF_MODEL,
          messages: createMessages(task),
          parameters: { max_new_tokens: 512, temperature: 0.1 },
        });

        const content = completion.choices[0].message.content;
        const cleanedContent = content?.match(/\[(.*?)\]/);

        if (!cleanedContent) {
          throw new Error(
            `No se encontró una lista válida en la respuesta: ${content}`
          );
        }

        try {
          const TAB_CHARACTER = "\t";
          const LINE_FEED = "\n";
          const CARRIAGE_RETURN = "\r";
          const FORM_FEED = "\f";
          const BACKSPACE = "\b";
          const VERTICAL_TAB = "\v";
          const NULL_CHARACTER = "\0";
          const DELETE_CHARACTER = "\x7F";
          const CONTROL_SEQUENCES = `${TAB_CHARACTER}${LINE_FEED}${CARRIAGE_RETURN}${FORM_FEED}${BACKSPACE}${VERTICAL_TAB}${NULL_CHARACTER}${DELETE_CHARACTER}`;
          const cleanedContentWithoutControlSequences =
            cleanedContent[1].replace(
              new RegExp(`[${CONTROL_SEQUENCES}]`, "g"),
              ""
            );
          const contents: string[] = JSON.parse(
            `[${cleanedContentWithoutControlSequences}]`
          );
          const data: Item[] = contents.map((c: string) => ({
            id: crypto.randomUUID(),
            title: c,
            completed: false,
          }));
          return NextResponse.json(
            {
              status: "success",
              message: "Task items successfully generated",
              data,
            },
            { status: 200 }
          );
        } catch (e) {
          throw new Error(
            `La respuesta del modelo no se pudo convertir a una lista: ${content}. Detalles: ${e}`
          );
        }
      } catch (e: unknown) {
        attempt++;
        lastError = e;
        if (attempt < MAX_RETRIES) {
          continue;
        }
        return NextResponse.json(
          { status: "error", message: (lastError as Error).message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { status: "error", message: "Error al generar las subtareas." },
      { status: 500 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
